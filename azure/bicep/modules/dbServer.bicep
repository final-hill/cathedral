param location string
param name string
@secure()
param postgresUser string
@secure()
param postgresPassword string

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

  resource dbServerAllAzureFirewallRule 'firewallRules@2023-12-01-preview' = {
    name: 'AllowAllAzureServicesAndResourcesWithinAzureIps_2024-7-27_12-38-13'
    properties: {
      startIpAddress: '0.0.0.0'
      endIpAddress: '0.0.0.0'
    }
  }

  resource dbServerAdminClientFirewallRule 'firewallRules@2023-12-01-preview' = {
    name: 'ClientIPAddress_2024-7-27_12-8-16'
    properties: {
      startIpAddress: '98.144.135.200'
      endIpAddress: '98.144.135.200'
    }
  }
}
