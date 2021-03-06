import { Database, DocumentCollection } from "arangojs";
import { Config } from "arangojs/lib/cjs/connection";
import { Graph, GraphVertexCollection } from "arangojs/lib/cjs/graph";
export declare class AutoDatabse extends Database {
    constructor(config?: Config);
    /**
     * Will asthmatically create a database of the name if it doesn't exist.
     * @param databaseName
     */
    autoUseDatabase(databaseName: string): Promise<this>;
    /**
     * Will automatically create a graph if one doesn't exist
     * @param properties
     * @param opts
     */
    autoGraph(properties: any, opts?: any): Promise<Graph>;
    /**
     * Will automatically create a collection of the name if it doesn't exist.
     * @param collectionName
     * @param graphRef
     */
    autoCollection(collectionName: string, graphRef?: Graph): Promise<DocumentCollection | GraphVertexCollection>;
}
