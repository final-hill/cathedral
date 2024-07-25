targetScope = 'resourceGroup'

// @allowed(['dev', 'prod'])
// param environment string = 'dev'
param location string = resourceGroup().location
@minLength(3)
@maxLength(22)
param name string = 'cathedral'
// param dockerComposeFile string

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
      // linuxFxVersion: 'COMPOSE|${base64(dockerComposeFile)}'
      linuxFxVersion: 'COMPOSE|'
      ftpsState: 'Disabled'
      http20Enabled: true
      appSettings: [
        // https://learn.microsoft.com/en-us/azure/app-service/configure-custom-container?tabs=debian&pivots=container-linux#use-persistent-shared-storage
        {
          name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
          value: 'true'
        }
      ]
    }
  }
}
