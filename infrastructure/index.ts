import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as docker from "@pulumi/docker-build";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();


// Create a new ECR repository
const repository = new awsx.ecr.Repository("weather-sync-deploy-ecr-repo");
const { userName, password } = aws.ecr.getAuthorizationTokenOutput({
  registryId: repository.repository.registryId,
});

// Create a image from the Dockerfile in the current directory
const image = new docker.Image("deploy-weather-sync-docker-image", {
  context: {
    location: "../",
  },
  builder: {
    name: "orbstack",
  },
  platforms: ["linux/amd64"],
  push: true,
  registries: [
    {
      address: repository.repository.repositoryUrl,
      username: userName,
      password: password,
    },
  ],
  tags: [pulumi.interpolate`${repository.repository.repositoryUrl}:latest`],
});

const cluster = new awsx.classic.ecs.Cluster(
  "deploy-weather-sync-container-cluster"
);

const loadBalancer = new awsx.classic.lb.ApplicationLoadBalancer(
  "deploy-weather-sync-lb",
  {
    securityGroups: cluster.securityGroups,
  }
);

const targetGroup = loadBalancer.createTargetGroup("deploy-weather-sync-tg", {
  protocol: "HTTP",
  port: 80,
  healthCheck: {
    protocol: "HTTP",
    path: "/health-check",
    interval: 30,
    healthyThreshold: 3,
    unhealthyThreshold: 3,
    timeout: 5,
  },
});

const listener = loadBalancer.createListener("deploy-weather-sync-listener", {
  protocol: "HTTP",
  port: 3333,
  targetGroup,
});

const app = new awsx.classic.ecs.FargateService("deploy-ecs-app", {
  cluster,
  desiredCount: 1,
  waitForSteadyState: false,
  taskDefinitionArgs: {
    container: {
      image: image.ref,
      cpu: 256,
      memory: 512,
      portMappings: [listener],
    },
  },
});

const scalingTarget = new aws.appautoscaling.Target("deploy-as-target", {
  minCapacity: 1,
  maxCapacity: 5,
  serviceNamespace: "ecs",
  resourceId: pulumi.interpolate`service/${cluster.cluster.name}/${app.service.name}`,
  scalableDimension: "ecs:service:DesiredCount",
});

new aws.appautoscaling.Policy("deploy-as-policy-cpu", {
  serviceNamespace: scalingTarget.serviceNamespace,
  scalableDimension: scalingTarget.scalableDimension,
  resourceId: scalingTarget.resourceId,
  policyType: "TargetTrackingScaling",
  targetTrackingScalingPolicyConfiguration: {
    predefinedMetricSpecification: {
      predefinedMetricType: "ECSServiceAverageCPUUtilization",
    },
    targetValue: 50,
  },
});

export const url = listener.endpoint.hostname;
