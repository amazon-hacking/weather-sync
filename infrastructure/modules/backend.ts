import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as docker from "@pulumi/docker-build";
import * as pulumi from "@pulumi/pulumi";

interface BackendInfrastructureArgs {
  sesAccessKey: aws.iam.AccessKey;
}

export function createBackendInfrastructure(args: BackendInfrastructureArgs) {
  const { sesAccessKey } = args;
  const config = new pulumi.Config();

  // ==============================================
  // ECR REPOSITORY
  // ==============================================
  const repository = new awsx.ecr.Repository("weather-sync-deploy-ecr-repo");

  const { userName, password } = aws.ecr.getAuthorizationTokenOutput({
    registryId: repository.repository.registryId,
  });

  // ==============================================
  // DOCKER IMAGE BUILD
  // ==============================================
  const image = new docker.Image("deploy-weather-sync-docker-image", {
    context: {
      location: "../apps/server",
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

  // ==============================================
  // ECS CLUSTER
  // ==============================================
  const cluster = new awsx.classic.ecs.Cluster(
    "deploy-weather-sync-container-cluster"
  );

  // ==============================================
  // LOAD BALANCER
  // ==============================================
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

  // ==============================================
  // ECS SERVICE (FARGATE)
  // ==============================================
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
        environment: [
          {
            name: "NODE_ENV",
            value: config.get("nodeEnv") || "production",
          },
          {
            name: "DATABASE_URL",
            value: config.requireSecret("databaseUrl"),
          },
          {
            name: "APP_PORT",
            value: config.get("appPort") || "3333",
          },
          {
            name: "JWT_SECRET",
            value: config.requireSecret("jwtSecret"),
          },
          {
            name: "TWILIO_ACCOUNT_SID",
            value: config.requireSecret("twilioAccountSid"),
          },
          {
            name: "TWILIO_AUTH_TOKEN",
            value: config.requireSecret("twilioAuthToken"),
          },
          {
            name: "TWILIO_PHONE_NUMBER",
            value: config.requireSecret("twilioPhoneNumber"),
          },
          {
            name: "TWILIO_TEMPLATE",
            value: config.get("twilioTemplate") || "weather-alert",
          },
          {
            name: "TWILIO_ACCOUNT",
            value: config.get("twilioAccount") || "main",
          },
          {
            name: "TWILIO_MESSAGING_SERVICE_SID",
            value: config.requireSecret("twilioMessagingServiceSid"),
          },
          {
            name: "ALLOWED_ORIGINS",
            value:
              config.get("allowedOrigins") || "https://weather-sync.com.br",
          },
          {
            name: "MAIL_FROM",
            value: config.get("mailFrom") || "noreply@weather-sync.com.br",
          },
          {
            name: "AWS_REGION",
            value: config.get("aws:region") || "us-east-1",
          },
          {
            name: "AWS_ACCESS_KEY_ID",
            value: sesAccessKey.id,
          },
          {
            name: "AWS_SECRET_ACCESS_KEY",
            value: sesAccessKey.secret,
          },
        ],
      },
    },
  });

  // ==============================================
  // AUTO SCALING
  // ==============================================
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

  return {
    repository,
    image,
    cluster,
    loadBalancer,
    targetGroup,
    listener,
    app,
    scalingTarget,
    backendUrl: listener.endpoint.hostname,
  };
}
