targetScope = 'resourceGroup'

// @allowed(['dev', 'prod'])
// param environment string = 'dev'
param location string = resourceGroup().location
@minLength(3)
@maxLength(22)
param name string = 'cathedral'

var base64Compose = loadFileAsBase64('../../compose.yml')

@secure()
param authOrigin string
@secure()
param authSecret string
@secure()
param ghClientId string
@secure()
param ghClientSecret string
@secure()
param postgresDb string
@secure()
param postgresHost string
@secure()
param postgresPassword string
@secure()
param postgresPort string
@secure()
param postgresUser string

resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: toLower('plan-${name}')
  location: location
  kind: 'linux'
  sku: {
    name: 'B2'
    tier: 'Basic'
    size: 'B2'
    family: 'B'
    capacity: 1
  }
  properties: {
    reserved: true
  }
}

resource appService 'Microsoft.Web/sites@2023-12-01' = {
  name: toLower('app-${name}')
  kind: 'app,linux,container'
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    reserved: true
    clientAffinityEnabled: false
    publicNetworkAccess: 'Enabled'
    siteConfig: {
      // Possible values obtainable from:
      // az webapp list-runtimes --os linux
      linuxFxVersion: 'COMPOSE|${base64Compose}'
      ftpsState: 'Disabled'
      http20Enabled: true
      appSettings: [
        // https://learn.microsoft.com/en-us/azure/app-service/configure-custom-container?tabs=debian&pivots=container-linux#use-persistent-shared-storage
        {
          name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
          value: 'true'
        }
        {
          name: 'DOCKER_ENABLE_CI'
          value: 'true'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_URL'
          value: 'https://index.docker.io/v1/'
        }
        {
          name: 'AUTH_ORIGIN'
          value: authOrigin
        }
        {
          name: 'AUTH_SECRET'
          value: authSecret
        }
        {
          name: 'GH_CLIENT_ID'
          value: ghClientId
        }
        {
          name: 'GH_CLIENT_SECRET'
          value: ghClientSecret
        }
        {
          name: 'POSTGRES_DB'
          value: postgresDb
        }
        {
          name: 'POSTGRES_HOST'
          value: postgresHost
        }
        {
          name: 'POSTGRES_PASSWORD'
          value: postgresPassword
        }
        {
          name: 'POSTGRES_PORT'
          value: postgresPort
        }
        {
          name: 'POSTGRES_USER'
          value: postgresUser
        }
      ]
    }
  }
  resource appConfigLogs 'config@2023-12-01' = {
    name: 'logs'
    properties: {
      applicationLogs: {
        fileSystem: {
          level: 'Information'
        }
      }
      detailedErrorMessages: {
        enabled: true
      }
      failedRequestsTracing: {
        enabled: true
      }
      httpLogs: {
        fileSystem: {
          retentionInDays: 3
          retentionInMb: 50
          enabled: true
        }
      }
    }
  }
}
