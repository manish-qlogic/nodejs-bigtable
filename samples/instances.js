/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// Imports the Google Cloud client library
const Bigtable = require('@google-cloud/bigtable');

async function runInstanceOperations(instanceName, clusterName) {
  const bigtable = new Bigtable();
  const instance = bigtable.instance(instanceName);

  console.log(`Check Instance Exists`);
  // [START bigtable_check_instance_exists]
  let instanceExists;
  try {
    [instanceExists] = await instance.exists();
  } catch (err) {
    console.error(`Error checking if Instance exists:`, err);
    return;
  }
  // [END bigtable_check_instance_exists]

  // Create instance if does not exists
  if (!instanceExists) {
    console.log(`Creating a PRODUCTION Instance`);
    // [START bigtable_create_prod_instance]
    // Creates a Production Instance with the name "ssd-instance"
    // with cluster id "ssd-cluster", 3 nodes and location us-central1-f

    const instanceOptions = {
      clusters: [
        {
          name: clusterName,
          nodes: 3,
          location: 'us-central1-f',
          storage: 'ssd',
        },
      ],
      type: 'PRODUCTION', // Optional as default type is PRODUCTION
      labels: {'prod-label': 'prod-label'},
    };

    // Create production instance with given options
    try {
      const [prodInstance] = await instance.create(instanceOptions);
      console.log(`Created Instance: ${prodInstance.name}`);
    } catch (err) {
      console.error('Error creating prod-instance:', err);
      return;
    }
    // [END bigtable_create_prod_instance]
  } else {
    console.log(`Instance ${instance.name} exists`);
  }

  console.log(); //for just a new-line
  console.log(`Listing Instances:`);
  // [START bigtable_list_instances]
  try {
    const [instances] = await bigtable.getInstances();
    instances.forEach(instance => {
      console.log(instance.name);
    });
  } catch (err) {
    console.error('Error listing instances:', err);
    return;
  }
  // [END bigtable_list_instances]

  console.log(); //for just a new-line
  console.log(`Get Instance`);
  // [START bigtable_get_instance]
  try {
    const [instance] = await bigtable.instance(instanceName).get();
    console.log(`Instance Name: ${instance.name}`);
    console.log(`Instance Meta: ${JSON.stringify(instance.metadata)}`);
  } catch (err) {
    console.error('Error getting instance:', err);
    return;
  }
  // [END bigtable_get_instance]

  console.log(); //for just a new-line
  console.log(`Listing Clusters...`);
  // [START bigtable_get_clusters]
  try {
    const instance = bigtable.instance(instanceName);
    const [clusters] = await instance.getClusters();
    clusters.forEach(cluster => {
      console.log(cluster.id);
    });
  } catch (err) {
    console.error('Error creating cluster:', err);
    return;
  }
  // [END bigtable_get_clusters]
}

// Creates a Development instance with the name "hdd-instance"
// with cluster name "hdd-cluster" and location us-central1-f
// Cluster nodes should not be set while creating Development Instance
async function createDevInstance(instanceName, clusterName) {
  const bigtable = new Bigtable();

  // [START bigtable_create_dev_instance]
  console.log(); //for just a new-line
  console.log(`Creating a DEVELOPMENT Instance`);
  // Set options to create an Instance
  const options = {
    clusters: [
      {
        name: clusterName,
        location: 'us-central1-f',
        storage: 'hdd',
      },
    ],
    type: 'DEVELOPMENT',
    labels: {'dev-label': 'dev-label'},
  };

  // Create development instance with given options
  try {
    let [instance] = await bigtable.createInstance(instanceName, options);
    console.log(`Created development instance: ${instance.name}`);
  } catch (err) {
    console.error('Error creating dev-instance:', err);
    return;
  }
  // [END bigtable_create_dev_instance]
}

// Delete the Instance
async function deleteInstance(instanceName) {
  // Creates a client
  const bigtable = new Bigtable();
  const instance = bigtable.instance(instanceName);

  // [START bigtable_delete_instance]
  console.log(); //for just a new-line
  console.log(`Deleting Instance`);
  try {
    await instance.delete();
    console.log(`Instance deleted: ${instance.name}`);
  } catch (err) {
    console.error('Error deleting instance:', err);
  }
  // [END bigtable_delete_instance]
}

// Add Cluster
async function addCluster(instanceName, clusterName) {
  const bigtable = new Bigtable();
  const instance = bigtable.instance(instanceName);

  let instanceExists;
  try {
    [instanceExists] = await instance.exists();
  } catch (err) {
    console.error(`Error checking if Instance exists:`, err);
    return;
  }

  if (!instanceExists) {
    console.log(`Instance does not exists`);
  } else {
    console.log(); //for just a new-line
    console.log(`Adding Cluster to Instance ${instance.name}`);
    // [START bigtable_create_cluster]
    const clusterOptions = {
      location: 'us-central1-c',
      nodes: 3,
      storage: 'ssd',
    };

    try {
      const [cluster] = await instance.createCluster(
        clusterName,
        clusterOptions
      );
      console.log(`Cluster created: ${cluster.id}`);
    } catch (err) {
      console.error('Error creating cluster:', err);
      return;
    }
    // [END bigtable_create_cluster]
  }
}

// Delete the Cluster
async function deleteCluster(instanceName, clusterName) {
  const bigtable = new Bigtable();
  const instance = bigtable.instance(instanceName);
  const cluster = instance.cluster(clusterName);

  // [START bigtable_delete_cluster]
  console.log(); //for just a new-line
  console.log(`Deleting Cluster`);
  try {
    await cluster.delete();
  } catch (err) {
    console.error('Error deleting cluster:', err);
    return;
  }
  console.log(`Cluster deleted: ${cluster.id}`);
  // [END bigtable_delete_cluster]
}

require(`yargs`)
  .demand(1)
  .command(
    `run`,
    `Creates an Instance(type: PRODUCTION) and run basic instance-operations`,
    {},
    argv => runInstanceOperations(argv.instance, argv.cluster)
  )
  .example(
    `node $0 run --instance [instanceName] --cluster [clusterName]`,
    `Run instance operations`
  )
  .command(`dev-instance`, `Create Development Instance`, {}, argv =>
    createDevInstance(argv.instance, argv.cluster)
  )
  .example(
    `node $0 dev-instance --instance [instanceName]`,
    `Create Development Instance`
  )
  .command(`del-instance`, `Delete the Instance`, {}, argv =>
    deleteInstance(argv.instance)
  )
  .example(
    `node $0 del-instance --instance [instanceName]`,
    `Delete the Instance.`
  )
  .command(`add-cluster`, `Add Cluster`, {}, argv =>
    addCluster(argv.instance, argv.cluster)
  )
  .example(
    `node $0 add-cluster --instance [instanceName] --cluster [clusterName]`,
    `Add Cluster`
  )
  .command(`del-cluster`, `Delete the Cluster`, {}, argv =>
    deleteCluster(argv.instance, argv.cluster)
  )
  .example(
    `node $0 del-cluster --instance [instanceName] --cluster [clusterName]`,
    `Delete the Cluster`
  )
  .wrap(120)
  .nargs('instance', 1)
  .nargs('cluster', 1)
  .describe('instance', 'Cloud Bigtable Instance name')
  .describe('cluster', 'Cloud Bigtable Cluster name')
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/bigtable/docs`)
  .help()
  .strict().argv;
