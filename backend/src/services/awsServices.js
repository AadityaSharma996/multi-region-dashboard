require("dotenv").config();

const { EC2Client, DescribeInstancesCommand, DescribeAvailabilityZonesCommand, DescribeRegionsCommand } = require("@aws-sdk/client-ec2");
const { RDSClient, DescribeDBInstancesCommand } = require("@aws-sdk/client-rds");
const { LambdaClient, ListFunctionsCommand } = require("@aws-sdk/client-lambda");
const { EKSClient, ListClustersCommand, DescribeClusterCommand } = require("@aws-sdk/client-eks");
const { ElasticLoadBalancingV2Client, DescribeLoadBalancersCommand } = require("@aws-sdk/client-elastic-load-balancing-v2");
const { S3Client, ListBucketsCommand, GetBucketLocationCommand } = require("@aws-sdk/client-s3");

// ─── Shared client factory ────────────────────────────────────────────────────
const getClient = (ClientClass, region) =>
  new ClientClass({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

// ─── 1. All enabled regions ───────────────────────────────────────────────────
async function getAllRegions() {
  const client = getClient(EC2Client, "us-east-1");
  const res = await client.send(new DescribeRegionsCommand({ AllRegions: false }));
  return res.Regions.map((r) => r.RegionName).sort();
}

// ─── 2. EC2 instances grouped by AZ ──────────────────────────────────────────
async function getEC2Data(region) {
  const client = getClient(EC2Client, region);
  const [instancesRes, azsRes] = await Promise.all([
    client.send(new DescribeInstancesCommand({})),
    client.send(new DescribeAvailabilityZonesCommand({})),
  ]);

  const azMap = {};
  azsRes.AvailabilityZones.forEach((az) => {
    azMap[az.ZoneName] = { name: az.ZoneName, state: az.State, instances: [] };
  });

  instancesRes.Reservations.forEach((reservation) => {
    reservation.Instances.forEach((inst) => {
      const az = inst.Placement?.AvailabilityZone;
      if (az && azMap[az]) {
        azMap[az].instances.push({
          id: inst.InstanceId,
          type: inst.InstanceType,
          state: inst.State.Name,
          name: inst.Tags?.find((t) => t.Key === "Name")?.Value || "-",
          launchTime: inst.LaunchTime,
        });
      }
    });
  });

  return Object.values(azMap);
}

// ─── 3. RDS instances ─────────────────────────────────────────────────────────
async function getRDSData(region) {
  const client = getClient(RDSClient, region);
  const res = await client.send(new DescribeDBInstancesCommand({}));
  return res.DBInstances.map((db) => ({
    id: db.DBInstanceIdentifier,
    engine: db.Engine,
    engineVersion: db.EngineVersion,
    status: db.DBInstanceStatus,
    az: db.AvailabilityZone,
    instanceClass: db.DBInstanceClass,
    multiAZ: db.MultiAZ,
  }));
}

// ─── 4. Lambda functions (paginated) ─────────────────────────────────────────
async function getLambdaData(region) {
  const client = getClient(LambdaClient, region);
  const functions = [];
  let marker;

  do {
    const res = await client.send(
      new ListFunctionsCommand({ Marker: marker, MaxItems: 50 })
    );
    functions.push(
      ...res.Functions.map((fn) => ({
        name: fn.FunctionName,
        runtime: fn.Runtime,
        state: fn.State || "Active",
        memory: fn.MemorySize,
        timeout: fn.Timeout,
        lastModified: fn.LastModified,
      }))
    );
    marker = res.NextMarker;
  } while (marker);

  return functions;
}

// ─── 5. EKS clusters ─────────────────────────────────────────────────────────
async function getEKSData(region) {
  const client = getClient(EKSClient, region);
  const listRes = await client.send(new ListClustersCommand({}));
  if (!listRes.clusters.length) return [];

  const details = await Promise.all(
    listRes.clusters.map((name) =>
      client.send(new DescribeClusterCommand({ name }))
    )
  );

  return details.map((r) => ({
    name: r.cluster.name,
    status: r.cluster.status,
    version: r.cluster.version,
    endpoint: r.cluster.endpoint ? "configured" : "none",
    createdAt: r.cluster.createdAt,
  }));
}

// ─── 6. ELB load balancers ────────────────────────────────────────────────────
async function getELBData(region) {
  const client = getClient(ElasticLoadBalancingV2Client, region);
  const res = await client.send(new DescribeLoadBalancersCommand({}));
  return res.LoadBalancers.map((lb) => ({
    name: lb.LoadBalancerName,
    type: lb.Type,
    state: lb.State?.Code,
    scheme: lb.Scheme,
    azs: lb.AvailabilityZones?.map((az) => az.ZoneName),
    dns: lb.DNSName,
  }));
}

// ─── 7. S3 buckets filtered by region ────────────────────────────────────────
async function getS3Data(targetRegion) {
  const client = getClient(S3Client, "us-east-1");
  const listRes = await client.send(new ListBucketsCommand({}));

  const buckets = await Promise.allSettled(
    listRes.Buckets.map(async (b) => {
      try {
        const locRes = await client.send(
          new GetBucketLocationCommand({ Bucket: b.Name })
        );
        const region = locRes.LocationConstraint || "us-east-1";
        return { name: b.Name, region, createdAt: b.CreationDate };
      } catch {
        return null;
      }
    })
  );

  return buckets
    .filter((r) => r.status === "fulfilled" && r.value?.region === targetRegion)
    .map((r) => r.value);
}

// ─── Master aggregator: ALL services for one region in parallel ───────────────
async function getRegionData(region) {
  const [ec2AZs, rds, lambda, eks, elb, s3] = await Promise.allSettled([
    getEC2Data(region),
    getRDSData(region),
    getLambdaData(region),
    getEKSData(region),
    getELBData(region),
    getS3Data(region),
  ]);

  return {
    region,
    timestamp: new Date().toISOString(),
    ec2:    { azs: ec2AZs.status === "fulfilled" ? ec2AZs.value : [] },
    rds:    rds.status    === "fulfilled" ? rds.value    : [],
    lambda: lambda.status === "fulfilled" ? lambda.value : [],
    eks:    eks.status    === "fulfilled" ? eks.value    : [],
    elb:    elb.status    === "fulfilled" ? elb.value    : [],
    s3:     s3.status     === "fulfilled" ? s3.value     : [],
  };
}

module.exports = { getAllRegions, getRegionData };
