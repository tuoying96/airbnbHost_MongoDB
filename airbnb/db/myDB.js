const { MongoClient, ObjectId } = require("mongodb");

function myDB() {
  const myDB = {};
  const dbName = "airbnb";
  const colName = "hosts";
  const uri = process.env.MONGO_URL || "mongodb://localhost:27017";

  myDB.getHosts = async function (page) {
    const client = MongoClient(uri, { useUnifiedTopology: true });
    try {
      await client.connect();
      const db = client.db(dbName);
      const col = db.collection(colName);
      const query = [
        {
          "$lookup": {
            "from": "listings", 
            "localField": "hostid", 
            "foreignField": "hostid", 
            "as": "hostsListings"
          }
        }, {
          "$unwind": "$hostsListings"
        }, {
          "$unwind": "$_id"
        }, {
          "$group": {
            "_id": "$_id", 
            "hostid": {
              "$first": "$hostid"
            }, 
            "name": {
              "$first": "$name"
            }, 
            "email": {
              "$first": "$email"
            }, 
            "phone": {
              "$first": "$phone"
            }, 
            "hostRating": {
              "$avg": "$hostsListings.rating"
            }
          }
        }
      ];

      return await col
        .aggregate(query)
        // sort in descending order by creation
        .sort({ _id: -1 })
        .limit(20)
        .toArray();
    } finally {
      client.close();
    }
  };

  myDB.createHost = async function (host) {
    const client = MongoClient(uri, { useUnifiedTopology: true });
    try {
      await client.connect();
      const db = client.db(dbName);
      const col = db.collection(colName);
      col.insertOne(host);
      // const last = col.find().sort({"_id":-1}).limit(1);
      // console.log(host._id);

      return await col.updateOne(
        { _id: ObjectId(host._id) },
        {
          $set: {
            hostid: +0,
          },
        }
      );

      // return await col.insertOne(host);
      
    } finally {
      client.close();
    }

  };
  myDB.updateHost = async function (host) {
    const client = MongoClient(uri, { useUnifiedTopology: true });
    try {
      await client.connect();
      const db = client.db(dbName);
      const col = db.collection(colName);
      console.log(host._id);
      console.log(host.name);
      console.log(host.email);
      console.log(host.phone);


      return await col.updateOne(
        { _id: ObjectId(host._id) },
        {
          $set: {
            name: host.name,
            email: host.email,
            phone: host.phone
          },
        }
      );
    } finally {
      client.close();
    }
  };

  myDB.deleteHost = async function (host) {
    const client = MongoClient(uri, { useUnifiedTopology: true });
    try {
      await client.connect();
      const db = client.db(dbName);
      const col = db.collection(colName);
      // console.log(host);
      // console.log(host._id);
      // console.log(ObjectId(host._id));

      return await col.deleteOne({ "_id": ObjectId(host._id) });
    } finally {
      client.close();
    }
  };

  return myDB;
}

module.exports = myDB();
