const { MongoClient } = require('mongodb');

async function main(){
    const uri = "mongodb+srv://admin:admin@cluster0.gikvy.mongodb.net/loginDB?retryWrites=true&w=majority";

    const client = new MongoClient(uri);

    try{
        await client.connect();
        await listDatabases(client);
    }catch(err){
        console.log(err);
    }finally{
        await client.close();
    }
}

main().catch(console.error);

async function listDatabases(client){
    const databasesList = client.db().admin().listDatabases();
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(`- ${db.name}`))
}