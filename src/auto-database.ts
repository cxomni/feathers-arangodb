/*
Extends the ArangoDB Database Class to offer helper functions.
 */
import { Database, DocumentCollection } from "arangojs";
import { Config } from "arangojs/lib/cjs/connection";
import { Graph, GraphVertexCollection } from "arangojs/lib/cjs/graph";
import { ArangoError } from "arangojs/lib/cjs/error";

export class AutoDatabse extends Database {
  constructor(config?: Config) {
    super(config);
  }

  /**
   * Will asthmatically create a database of the name if it doesn't exist.
   * @param databaseName
   */
  async autoUseDatabase(databaseName: string): Promise<this> {
    const databaseList = await this.listUserDatabases();
    /* istanbul ignore next  */
    if (databaseList.indexOf(databaseName) === -1) {
      /* istanbul ignore next  ArangoDB Driver tests covered in driver*/
      await this.createDatabase(databaseName).catch((err: ArangoError) => {
        if (err.isArangoError && err.errorNum == 1207) {
          // If a database with the same name is created at the same time as another, this can cause a race condition.
          // Ignore race conditions and continue.
          return true;
        } else {
          throw err;
        }
      });
    }
    this.useDatabase(databaseName);
    return this;
  }

  /**
   * Will automatically create a graph if one doesn't exist
   * @param properties
   * @param opts
   */
  async autoGraph(properties: any, opts?: any): Promise<Graph> {
    const name = properties.name;
    let graph = this.graph(name);
    const exists = await graph.exists();
    if (!exists) {
      await graph.create(properties).catch((err: ArangoError) => {
        if (err.isArangoError && err.errorNum == 1207) {
          // If a database with the same name is created at the same time as another, this can cause a race condition.
          // Ignore race conditions and continue.
          return true;
        } else {
          throw err;
        }
      });
    }
    return graph;
  }

  /**
   * Will automatically create a collection of the name if it doesn't exist.
   * @param collectionName
   * @param graphRef
   */
  async autoCollection(
    collectionName: string,
    graphRef?: Graph
  ): Promise<DocumentCollection | GraphVertexCollection> {
    /* istanbul ignore next  */
    const collectionList = graphRef
      ? await graphRef.listVertexCollections()
      : await this.collections();
    /* istanbul ignore next  */
    if (
      collectionList.map((item: any) => item.name).indexOf(collectionName) ===
      -1
    ) {
      /* istanbul ignore next  */
      if (graphRef) {
        await graphRef.addVertexCollection(collectionName);
      } else {
        /* istanbul ignore next  */
        await this.collection(collectionName)
          .create({ waitForSync: true })
          .catch(err => {
            if (err.isArangoError && err.errorNum == 1207) {
              // If a collection with the same name is created at the same time as another, this can cause a race condition.
              // Ignore race conditions and continue.
              return true;
            } else {
              throw err;
            }
          });
      }
    }
    return graphRef
      ? graphRef.vertexCollection(collectionName)
      : this.collection(collectionName);
  }
}
