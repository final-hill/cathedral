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
@secure()
param slackAdminMemberId string
@secure()
param slackBotToken string
@secure()
param slackSigningSecret string

module appInsights './modules/appInsights.bicep' = {
  name: 'appInsights'
  params: {
    location: location
    name: name
  }
}

module dbServer './modules/dbServer.bicep' = {
  name: 'dbServer'
  params: {
    location: location
    name: name
    postgresUser: postgresUser
    postgresPassword: postgresPassword
  }
}

module appService './modules/appService.bicep' = {
  name: 'appService'
  dependsOn: [
    dbServer
  ]
  params: {
    location: location
    appInsightsInstrumentationKey: appInsights.outputs.appInsightsInstrumentationKey
    appInsightsConnectionString: appInsights.outputs.appInsightsConnectionString
    name: name
    authOrigin: authOrigin
    authSecret: authSecret
    ghClientId: ghClientId
    ghClientSecret: ghClientSecret
    postgresDb: postgresDb
    postgresHost: postgresHost
    postgresPassword: postgresPassword
    postgresPort: postgresPort
    postgresUser: postgresUser
    slackAdminMemberId: slackAdminMemberId
    slackBotToken: slackBotToken
    slackSigningSecret: slackSigningSecret
  }
}
