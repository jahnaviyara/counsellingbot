/*var mongojs = require('mongojs');
var dbobject = mongojs('mongodb://jahnavi:jahnavi@cluster0-shard-00-00-lhkoh.mongodb.net:27017,cluster0-shard-00-01-lhkoh.mongodb.net:27017,cluster0-shard-00-02-lhkoh.mongodb.net:27017/BOT?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority',['ids','details','faculty'])
*/

var mongojs = require('mongojs');
var dbobject = mongojs('mongodb://supriya:santoshi@cluster0-shard-00-00-pgw1n.mongodb.net:27017,cluster0-shard-00-01-pgw1n.mongodb.net:27017,cluster0-shard-00-02-pgw1n.mongodb.net:27017/BOT?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority',['details','ids','faculty'])

var isRegisteredUser=function(fromid,callbackfunc){
    dbobject.ids.find({"chatid":fromid},function(error,docs){
        if(error){
          callbackfunc(error,null)
        }
        else if(docs.length == 0){
            callbackfunc(new Error('User is not registered'),null)
        }
        else{
            callbackfunc(null,docs)
        }
    })
  
}
var findUserType=function(info,callbackfunc){
    if(info.hasOwnProperty("name"))
        callbackfunc("faculty")
    else if(info.hasOwnProperty("regdno"))
        callbackfunc("student")
}

var findStudentsForFaculty=function(facultyid,callbackfunc){
    dbobject.details.find({"facultyid":facultyid},function(error,docs){
        //console.log(docs)
        if(error){
          callbackfunc(error,null)
        }
        else{
          var regnos=[];
          var i = 0;
          docs.forEach(function(element){
            var regno = element.regdno;
            regnos[i] = regno;
            i++;
          })
          callbackfunc(null,regnos)
        }
    })
}        

var findStudentIds=function(regnos,callbackfunc){
    dbobject.ids.find({"regdno":{$in:regnos} },function(err,docs){
        if(err){
            callbackfunc(err,null)
        }
        else{
            callbackfunc(null,docs)
        }
    })    
}

var findFacultyForStudent=function(regdno,callbackfunc){
    dbobject.details.find({"regdno":regdno},function(error,docs){
        if(error){
            callbackfunc(error,null)
        }
        else{
            callbackfunc(null,docs)
        }
    })
}

var findFacultyid=function(name,callbackfunc){
    dbobject.faculty.find({"name":name},function(error,docs){
        if(error){
            callbackfunc(error,null)
        }
        else{
            callbackfunc(null,docs)
        }
    })
}
var updateFacultyIds=function(facultynames,callbackfunc){
    dbobject.details.aggregate([
        { 
            $match : { name : { $in: facultynames } } 
        },
        {
            $lookup: {
                from: "ids",
                localField: "name",
                foreignField: "name",
                as: "R"
            } 
        },
        { 
            $match: { $expr: { $gt: [ { $size: "$R" }, 0 ] } } 
        }
    ],function(error,docs){
             if(error)
             callbackfunc(error,null)
             else{
                var bulk = dbobject.details.initializeOrderedBulkOp()
                var count = 0;
                 docs.forEach(function(doc){
                     //console.log(doc)
                     //bulkop.find({ lastname:"Haley" }).updateOne( { $set: { year:1925 } } ); 
                     bulk.find({ _id: doc._id }).updateOne({ $set: { facultyid: doc.R[0].chatid } })
                     //bulk.updateOne({ _id: doc._id }, { $set: { facultyid: doc.R[0].chatid } } ) 
                     count=count+1
                 })
                 bulk.execute(function(error) {
                    if(error) {
                      callbackfunc(error,null)
                    }
                    else {
                      callbackfunc(null,count) //goto index.js
                      //res.render('uploadstatus',{msg:count+"CSV files updated"})
                    }
                  })
                 
             }
             
         })//run it.got thutput? yes sir.run the code got the output sir.
}
    //forEach( doc => dbobject.details.updateOne( { _id: doc._id }, { $set: { facultyid: doc.R[0].chatid } } ) )
    // ,function(error,docs){
    //     if(error)
    //     console.log(error)
    //     else
    //     console.log(docs[0].R[0].chatid);
    // })

var sendmessagetoall = function(callbackfunc){
    dbobject.ids.find({},function(error,docs){
        if(error){
            callbackfunc(error,null)
        }
        else{
            callbackfunc(null,docs)
        }
    })
}

var sendmessagetostudents = function(callbackfunc){
    dbobject.ids.find( { regdno: { $exists: true } },function(error,docs){
        if(error){
            callbackfunc(error,null)
        }
        else{
            callbackfunc(null,docs)
        }
    })
}

var sendmessagetocounsellers = function(callbackfunc){
    dbobject.ids.find( { name: { $exists: true } },function(error,docs){
        if(error){
            callbackfunc(error,null)
        }
        else{
            callbackfunc(null,docs)
        }
    })
}
/*
db.chatusers.find({}, function (err, docs) {
    //console.log(docs);
    //members=docs.length;
    if(docs.length>0)
    {
      
      for(var index=0;index<docs.length;index++)
      {
        var fromid=docs[index].fromid;
        console.log(fromid);
        bot.sendMessage(fromid, content);
        members++;

      }
      res.send('<h1>Message is posted successfully to members</h1>'); 
    }
   
   });
   db.records.find( { a: { $exists: true } } )
*/

module.exports.dbobject=dbobject;
module.exports.isRegisteredUser=isRegisteredUser;
module.exports.findUserType=findUserType;
module.exports.findStudentsForFaculty=findStudentsForFaculty
module.exports.findStudentIds=findStudentIds;
module.exports.findFacultyForStudent=findFacultyForStudent;
module.exports.findFacultyid=findFacultyid;
module.exports.updateFacultyIds=updateFacultyIds;
module.exports.sendmessagetoall=sendmessagetoall;
module.exports.sendmessagetostudents=sendmessagetostudents;
module.exports.sendmessagetocounsellers=sendmessagetocounsellers;