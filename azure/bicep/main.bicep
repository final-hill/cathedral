targetScope = 'resourceGroup'

// @allowed(['dev', 'prod'])
// param environment string = 'dev'
param location string = resourceGroup().location
@minLength(3)
@maxLength(22)
param name string = 'cathedral'

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
@secure()
param nuxtOrigin string
@secure()
param nuxtSessionPassword string
@secure()
param nuxtAzureOpenaiApiKey string
@secure()
param nuxtAzureOpenaiApiVersion string
@secure()
param nuxtAzureOpenaiEndpoint string
@secure()
param nuxtAzureOpenaiDeploymentId string

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
    postgresDb: postgresDb
    postgresHost: postgresHost
    postgresPassword: postgresPassword
    postgresPort: postgresPort
    postgresUser: postgresUser
    slackAdminMemberId: slackAdminMemberId
    slackBotToken: slackBotToken
    slackSigningSecret: slackSigningSecret
    nodeEnv: 'production'
    nuxtOrigin: nuxtOrigin
    nuxtSessionPassword: nuxtSessionPassword
    nuxtAzureOpenaiApiKey: nuxtAzureOpenaiApiKey
    nuxtAzureOpenaiApiVersion: nuxtAzureOpenaiApiVersion
    nuxtAzureOpenaiEndpoint: nuxtAzureOpenaiEndpoint
    nuxtAzureOpenaiDeploymentId: nuxtAzureOpenaiDeploymentId
  }
}
