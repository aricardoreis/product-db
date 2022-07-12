# Configure the Azure provider
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0.2"
    }
  }

  required_version = ">= 1.1.0"
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "${var.project}-${var.environment}-rg"
  location = var.location
}

resource "azurerm_storage_account" "storage_account" {
  name                     = "${var.project}${var.environment}sa"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_application_insights" "application_insights" {
  name                = "${var.project}-${var.environment}-ai"
  location            = var.location
  resource_group_name = azurerm_resource_group.rg.name
  application_type    = "Node.JS"
}

resource "azurerm_app_service_plan" "app_service_plan" {
  name                = "${var.project}-${var.environment}-sp"
  resource_group_name = azurerm_resource_group.rg.name
  location            = var.location
  kind                = "FunctionApp"
  reserved            = true # this has to be set to true for Linux. Not related to the Premium Plan
  sku {
    tier = "Standard"
    size = "S1"
  }
}

resource "azurerm_function_app" "function_app" {
  name                = "${var.project}-${var.environment}-fn-app"
  resource_group_name = azurerm_resource_group.rg.name
  location            = var.location
  app_service_plan_id = azurerm_app_service_plan.app_service_plan.id
  app_settings = {
    "WEBSITE_RUN_FROM_PACKAGE"       = "",
    "FUNCTIONS_WORKER_RUNTIME"       = "node",
    "APPINSIGHTS_INSTRUMENTATIONKEY" = azurerm_application_insights.application_insights.instrumentation_key,
  }
  os_type = "linux"
  site_config {
    linux_fx_version          = "node|14"
    use_32_bit_worker_process = false
  }
  storage_account_name       = azurerm_storage_account.storage_account.name
  storage_account_access_key = azurerm_storage_account.storage_account.primary_access_key
  version                    = "~3"

  lifecycle {
    ignore_changes = [
      app_settings["WEBSITE_RUN_FROM_PACKAGE"],
    ]
  }
}

resource "azurerm_cosmosdb_account" "cosmos-db" {
  name                = "${var.project}-${var.environment}-db"
  resource_group_name = azurerm_resource_group.rg.name
  location            = var.location
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"

  consistency_policy {
    consistency_level = "Session"
  }

  geo_location {
    location          = var.location
    failover_priority = 0
  }
}

resource "azurerm_cosmosdb_sql_database" "db" {
  name                = "product-db"
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.cosmos-db.name
}

resource "azurerm_cosmosdb_sql_container" "invoices" {
  name                = "invoices"
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.cosmos-db.name
  database_name       = azurerm_cosmosdb_sql_database.db.name
  partition_key_path  = "/id"
}
