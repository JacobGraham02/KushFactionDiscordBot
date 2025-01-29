import {DatabaseRepository} from "../../repository/DatabaseRepository";
import {Collection, Db} from "mongodb";

export class DataRepository extends DatabaseRepository<any> {
    private collection: Collection<any>

    constructor(private database: Db) {
        super();
        this.collection = this.database.collection("bot_data");
    }

    async create(data: any): Promise<any> {

    }

    async findById(id: string): Promise<any | null> {

    }

    async update(id: string, data: Partial<any>): Promise<any | null> {

    }

    async delete(id: string): Promise<any> {

    }
}
