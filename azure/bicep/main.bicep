targetScope = 'resourceGroup'

// @allowed(['dev', 'prod'])
// param environment string = 'dev'
param location string = resourceGroup().location
@minLength(3)
@maxLength(22)
param name string = 'cathedral'
// param dockerComposeFile string

// Dummy for testing
resource stg 'Microsoft.Storage/storageAccounts@2023-04-01' = {
  name: toLower('st${name}')
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    supportsHttpsTrafficOnly: true
  }
}

output storageEndpoint object = stg.properties.primaryEndpoints

// resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
//   name: toLower('plan-${name}-${environment}')
//   location: location
//   kind: 'linux'
//   sku: {
//     name: 'B2'
//     tier: 'Basic'
//     size: 'B2'
//     family: 'B'
//     capacity: 1
//   }
//   properties: {
//     reserved: true
//   }
// }

// resource appService 'Microsoft.Web/sites@2023-12-01' = {
//   name: toLower('app-${name}-${environment}')
//   kind: 'app,linux,container'
//   location: location
//   properties: {
//     serverFarmId: appServicePlan.id
//     httpsOnly: true
//     reserved: true
//     clientAffinityEnabled: false
//     publicNetworkAccess: 'Enabled'
//     siteConfig: {
//       // Possible values obtainable from:
//       // az webapp list-runtimes --os linux
//       linuxFxVersion: 'COMPOSE|${base64(dockerComposeFile)}'
//       ftpsState: 'Disabled'
//       http20Enabled: true
//       appSettings: [
//         // https://learn.microsoft.com/en-us/azure/app-service/configure-custom-container?tabs=debian&pivots=container-linux#use-persistent-shared-storage
//         {
//           name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
//           value: 'true'
//         }
//       ]
//     }
//   }
// }
