targetScope = 'resourceGroup'

// @allowed(['dev', 'prod'])
// param environment string = 'dev'
param location string = resourceGroup().location
@minLength(3)
@maxLength(22)
param name string = 'cathedral'

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
  dependsOn: [
    dbServer
  ]
  name: toLower('app-${name}')
  kind: 'app,linux'
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    reserved: true
    clientAffinityEnabled: false
    publicNetworkAccess: 'Enabled'
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      appCommandLine: 'node server/index.mjs'
      ftpsState: 'Disabled'
      http20Enabled: true
      appSettings: [
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

  resource appConfigWeb 'config@2023-12-01' = {
    name: 'web'
    properties: {
      cors: {
        allowedOrigins: [
          '*'
        ]
      }
      ipSecurityRestrictions: [
        {
          ipAddress: 'Any'
          action: 'Allow'
        }
      ]
      requestTracingEnabled: true
      requestTracingExpirationTime: '1'
      scmType: 'None'
      use32BitWorkerProcess: false
      webSocketsEnabled: true
    }
  }
}

// https://learn.microsoft.com/en-us/azure/templates/microsoft.dbforpostgresql/flexibleservers?pivots=deployment-language-bicep
resource dbServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-12-01-preview' = {
  name: toLower('db-${name}')
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    replica: {
      role: 'Primary'
    }
    replicationRole: 'Primary'
    storage: {
      iops: 120
      tier: 'P4'
      storageSizeGB: 32
      autoGrow: 'Disabled'
    }
    network: {
      publicNetworkAccess: 'Enabled'
    }
    dataEncryption: {
      type: 'SystemManaged'
    }
    authConfig: {
      activeDirectoryAuth: 'Disabled'
      passwordAuth: 'Enabled'
    }
    version: '16'
    administratorLogin: postgresUser
    administratorLoginPassword: postgresPassword
    availabilityZone: '1'
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
    maintenanceWindow: {
      customWindow: 'Disabled'
      dayOfWeek: 0
      startHour: 0
      startMinute: 0
    }
  }
}
