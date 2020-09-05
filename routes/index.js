process.env.NTBA_FIX_319=1
var express = require('express');
var router = express.Router();
var path = require('path');
var db = require('../utils/database.js');
var chatmessage=require('../utils/chatmessage.js')
var csv = require('csvtojson');
var mongojs = require('mongojs');
var request = require('request');
var fs = require('fs');
var TelegramBot = require('node-telegram-bot-api');
const { S_IFDIR } = require('constants');
const { start } = require('repl');
const { isNullOrUndefined } = require('util');
var token = '866791240:AAFrS0epP3WqHRSQv5Pz0e0KwC0v9C6DS2k';
var bot = new TelegramBot(token, {polling: true,onlyFirstMatch: true});

router.get('/', function(req, res, next) {
  res.render('login', {  });
});

router.get('/counsellingbot',function(req,res,next){
  res.render('login', {  });
})

router.get('/logout',function(req,res,next){
  res.render('login',{ })
})
router.post('/validation',function(req,res,next) {
  var username = req.body.uname;
  var password = req.body.psw;
  if(username === 'itcounsellingbot'){//username 
    if(password === 'Bot@svecwit') {//password
      //console.log("validated")
      res.render('header',{})
  }
  else {
    res.render('loginstatus',{msg:"Login failed try again."})
  }
}
  else {
    res.render('loginstatus',{msg:"Login failed try again."})
  }
})

router.get('/download',function(req,res,next) {
  res.download(path.join(__dirname,'../public/','UPDATE.csv'),'update.csv')
})

router.get('/download1',function(req,res,next) {
  res.download(path.join(__dirname,'../public/','details.csv'),'counsellersmapping.csv')
})

router.get('/download2',function(req,res,next) {
  res.download(path.join(__dirname,'../public/','faculty.csv'),'faculty.csv')
})

router.get('/uploadform',function(req,res,next){
  res.render('uploadform', {  });
})
router.get('/uploadformforfaculty',function(req,res,next){
  res.render('uploadformforfaculty', {  });
})
router.get('/updateform',function(req,res,next){
  res.render('updateform', {  });
})
router.get('/textform',function(req,res,next){
  res.render('textform', {  });
})


/*router.get('/uploadform.html',function(req,res,next){
  res.sendFile(path.join(__dirname,'../public/','uploadform.html'));
});*/

router.post('/upload',function(req,res,next) {
  var file = req.files.inputfile
  uploadedpath = path.join(__dirname,'../upload/',file.name)
  file.mv(uploadedpath,function(error) {
    if(error) {
      res.render('uploadstatus',{msg:"File upload error"})
    }
    else {
      csv()
      .fromFile(uploadedpath)  // promise operation
      .then(function(jsonarray) {
        var bulk = db.dbobject.details.initializeOrderedBulkOp()
        var count = 0;
        jsonarray.forEach(function(element) {
          bulk.insert(element)
          count = count + 1;
        })
        bulk.execute(function(error) {
          if(error) {
            console.log(error)
          }
          else {
            res.render('uploadstatus',{msg:count+" CSV data loaded Successfully."})
          }
        })
      })
    }
  })
})

/*router.get('/uploadformforfaculty.html',function(req,res,next){
  res.sendFile(path.join(__dirname,'../public/','uploadformforfaculty.html'));
});*/

router.post('/gettext',function(req,res,next){
  var sendmessage = "Admin Message:\n"+req.body.messagetobesent;// put message label before text area done sir.try it.try it.working sir .try it. working sir
  var sendto = req.body.radiobtn;
  //console.log(sendto)
  //console.log(sendmessage)
  if(sendto=="all"){
      db.sendmessagetoall(function(error,docs){
          if(error){
            console.log(error);
          }
          else{
            if(docs.length>0){
                for(var index=0;index<docs.length;index++){
                  var fromid=docs[index].chatid;
                  //console.log(fromid);
                  bot.sendMessage(fromid, sendmessage);
                }
                res.render('uploadstatus',{msg:'Message is posted successfully to members'})
                //res.send('<h1>Message is posted successfully to members</h1>'); 
            }
          }
      });
  }
  else if(sendto=="students"){
    db.sendmessagetostudents(function(error,docs){
      if(error){
        console.log(error);
      }
      else{
        if(docs.length>0){
            for(var index=0;index<docs.length;index++){
              var fromid=docs[index].chatid;
              //console.log(fromid);
              bot.sendMessage(fromid, sendmessage);
            }
            res.render('uploadstatus',{msg:'Message is posted successfully to members'}) 
        }
      }
  });
  }
  else if(sendto=="counsellers"){
    db.sendmessagetocounsellers(function(error,docs){
      if(error){
        console.log(error);
      }
      else{
        if(docs.length>0){
            for(var index=0;index<docs.length;index++){
              var fromid=docs[index].chatid;
              //console.log(fromid);
              bot.sendMessage(fromid, sendmessage);
            }
            res.render('uploadstatus',{msg:'Message is posted successfully to members'}) 
        }
      }
  });
}
})


router.post('/uploadforfaculty',function(req,res,next) {
  var file = req.files.inputfile
  uploadedpath = path.join(__dirname,'../upload/',file.name)
  file.mv(uploadedpath,function(error) {
    if(error) {
      res.render('uploadstatus',{msg:"File upload error"})
    }
    else {
      csv()
      .fromFile(uploadedpath)  // promise operation
      .then(function(jsonarray) {
        var bulk = db.dbobject.faculty.initializeOrderedBulkOp()
        var count = 0;
        jsonarray.forEach(function(element) {
          bulk.insert(element)
          count = count + 1;
        })
        bulk.execute(function(error) {
          if(error) {
            console.log(error)
          }
          else {
            res.render('uploadstatus',{msg:count+" CSV data loaded Successfully."})
          }
        })
      })
    }
  })
})


router.post('/update',function(req,res,next) {
  var file = req.files.inputfile
  var name;
  uploadedpath = path.join(__dirname,'../upload/',file.name)
  file.mv(uploadedpath,function(error) {
    if(error) {
      res.render('uploadstatus',{msg:"File upload error"})
    }
    else {
      csv()
      .fromFile(uploadedpath)  // promise operation
      .then(function(jsonarray) {
        var bulk = db.dbobject.details.initializeOrderedBulkOp()
        var count = 0;
        var facultynames = []
        jsonarray.forEach(function(element) {
          facultynames[count]=element.name
          bulk.find( { "regdno": element.regdno } ).update( { $set: { "regdno": element.regdno,"name": element.name,"facultyid": ""} } );
          count=count+1
        })
        bulk.execute(function(error) {
          if(error) {
            console.log(error)
          }
          else {
            db.updateFacultyIds(facultynames,function(error,status){
              if(error){
                console.log(error)
              }
              else{
                //console.log(count)
                res.render('uploadstatus',{msg:count+" CSV files updated"})//Shall i run sir?
              }

            })
            
          }
        })
       
      })
    }
    /*//console.log(name)
    db.dbobject.faculty.find({"name":name},function(err,docs){
      //console.log(docs)
      if(isNullOrUndefined(docs[0].facultyid)){
        //console.log("Faculty Id will be updated as soon as faculty has been the member.")
      }
      else{
        var id = docs[0].facultyid
        db.dbobject.students.findAndModify({query:{"name":name},update:{"facultyid":facultyid},new:true},function(error,docs) { 
          if(error) {
            console.log(error);
          }
          else {
            res.send("Updated Successfully");
          }
        })
      }
  })*/
})
})


bot.onText(/Faculty\/[0-9]{4}$/,function(msg){
  //console.log("92")
  var fromid = msg.chat.id;
  var facultyid=msg.text.split('/')[1]
  var jsonrow={'chatid': fromid, 'name': facultyid}
      db.dbobject.ids.find({"name":facultyid}, function (err, docs) {
        if(docs.length == 0){
          db.dbobject.ids.insert(jsonrow,function(err,newD){
            //console.log("Faculty Data is inserted");
          });
          db.dbobject.faculty.find({"name":facultyid},function(err,docs) {
            if(docs.length == 0) {
              bot.sendMessage(fromid,"Sorry,No students are assigned for you..")
            }
            else {
              db.dbobject.details.updateMany({"name":facultyid},{$set:{'facultyid':fromid}},function(err,newD){
                //console.log("Faculty ID's are updated for students.");
              });
              db.dbobject.faculty.update({"name":facultyid},{$set:{'facultyid':fromid}},function(err,newD){
                //console.log("Faculty Data updated.");
              });
              bot.sendMessage(fromid,"Now, you can send messages to your students.")
            }
          })
        }
        else{
          bot.sendMessage(fromid,facultyid+' is re-registered');
        }
      })
})

//student registration -1
bot.onText(/Student\/[0-9]{2}[a-z|A-Z|0-9]{4}[a-z|A-Z|0-9]{4}$/,function(msg){
  var fromid = msg.chat.id;
  console.log(fromid)
  var studregdno=msg.text.split('/')[1].toUpperCase()
  var jsonrow={'chatid': fromid , 'regdno': studregdno}
      db.dbobject.ids.find({"regdno":studregdno}, function (err, docs) {
        if(docs.length == 0){
          db.dbobject.ids.insert(jsonrow,function(err,newD){
            //console.log("Student Data is inserted");
          });
        }
        else{
          db.dbobject.ids.update({"regdno":studregdno},{$set:{'chatid':fromid}},function(err,newD){
            bot.sendMessage(fromid,studregdno+' is re-registered');
          })
        }
        bot.sendMessage(fromid,"Now, you can send messages to your faculty..")
      })
//bot.sendMessage(fromid, "Select to whom you want to talk", {"reply_markup": {"keyboard": [["ALL", "Students","Faculty","Allfaculty"]]}});
});

bot.on('message',function(msg){
  //console.log("143")
  //console.log(msg)
  chatmessage.findMessageType(msg,function(type){
    if(type=='/start'){
      var chatid = msg.chat.id;
      var str = "If you are a Student enter the command Student/<<student_regdno>>\nIf you are a Faculty enter the command Faculty/<<faculty_id>>\nFor example:Student/17B01A1201 or Faculty/1202"
      bot.sendMessage(chatid,str);
    }
    else if(type=='photo'){
      console.log(msg)
      var fromid = msg.chat.id;
      var jsonrow={'chatid': fromid}
      db.isRegisteredUser(fromid,function(error,docs){
        if(error){
          console.log(error)
        }
        else{
          var info = docs[0];
          db.findUserType(info,function(userType){
            if(userType=='faculty'){
              db.findStudentsForFaculty(fromid,function(error,regnos){
                if(error){
                  console.log(error)
                }
                else{
                  //console.log(regnos);
                  db.findStudentIds(regnos,function(error,docs){
                    if(error){
                      console.log(error)
                    }
                    else if(docs.length == 0){
                      bot.sendMessage(msg.chat.id,"None of your students are registered.You can start sending messages if atleast one of them are registered.")
                    }
                    else{
                        chatmessage.downloadPhotoFromMessage(msg,function(error,filepath){
                          if(error){
                            console.log(error)
                          }
                          else{
                            chatmessage.sendPhotoToStudents(bot,docs,filepath)
                          }
                        })
                      }
                  })
                }
              })
            }
            else if(userType=='student'){
              var reg = info.regdno;
              db.findFacultyForStudent(reg,function(error,docs){
                if(error){
                  console.log(error)
                }
                else if(docs[0].hasOwnProperty('facultyid') == false){
                  bot.sendMessage(msg.chat.id,"Your faculty is not registered.You can able to communicate with him,Once your faculty got registered")
                }
                else{
                  chatmessage.downloadPhotoFromMessage(msg,function(error,filepath){
                    if(error){
                      console.log(error)
                    }
                    else{
                      chatmessage.sendPhotoToFaculty(bot,docs[0].facultyid,reg,filepath)
                    }
                  })
                }
              })
            }
          })
        }
      })  
    }
    else if(type=='text'){
      console.log(msg)
      var fromid = msg.chat.id;
      var jsonrow={'chatid': fromid}
      db.isRegisteredUser(fromid,function(error,docs){
        if(error){
          console.log(error)
        }
        else{
          var info = docs[0];
          db.findUserType(info,function(userType){
            if(userType=='faculty'){
              db.findStudentsForFaculty(fromid,function(error,regnos){
                if(error){
                  console.log(error)
                }
                else{
                  //console.log(regnos);
                  db.findStudentIds(regnos,function(error,docs){
                    console.log(docs)
                    if(error){
                      console.log(error)
                    }
                    else if(docs.length == 0){
                      bot.sendMessage(msg.chat.id,"None of your students are registered.You can start sending messages if atleast one of them are registered.")
                    }
                    else{
                      chatmessage.sendTextToStudents(bot,docs,msg)
                    }
                  })
                }
              })
            }
            else if(userType=='student'){
              var reg = info.regdno;
              db.findFacultyForStudent(reg,function(error,docs){
                //console.log(docs)
                //console.log(docs[0].hasOwnProperty('facultyid'))
                if(error){
                  console.log(error)
                }
                else if(docs[0].hasOwnProperty('facultyid') == false){
                  bot.sendMessage(msg.chat.id,"Your faculty is not registered.You can able to communicate with him,Once your faculty got registered")
                }

                else{
                  chatmessage.sendTextToFaculty(bot,docs[0].facultyid,reg,msg)
                }
              })
            }
          })
        }
      })
    }
    else if(type=='video'){
      console.log(msg)
      var fromid = msg.chat.id;
      var jsonrow={'chatid': fromid}
      db.isRegisteredUser(fromid,function(error,docs){
        if(error){
          console.log(error)
        }
        else{
          var info = docs[0];
          db.findUserType(info,function(userType){
            if(userType=='faculty'){
              db.findStudentsForFaculty(fromid,function(error,regnos){
                if(error){
                  console.log(error)
                }
                else{
                  //console.log(regnos);
                  db.findStudentIds(regnos,function(error,docs){
                    if(error){
                      console.log(error)
                    }
                    else if(docs.length == 0){
                      bot.sendMessage(msg.chat.id,"None of your students are registered.You can start sending messages if atleast one of them are registered.")
                    }
                    else{
                        chatmessage.downloadVideoFromMessage(msg,function(error,filepath){
                          if(error){
                            console.log(error)
                          }
                          else if(filepath == "Bad Request: file is too big"){
                            //chatmessage.sendTextToStudents(bot,docs,msg)
                            bot.sendMessage(msg.chat.id,filepath);
                          }
                          else{
                            chatmessage.sendVideoToStudents(bot,docs,filepath)
                          }
                        })
                      }
                  })
                }
              })
            }
            else if(userType=='student'){
              var reg = info.regdno;
              db.findFacultyForStudent(reg,function(error,docs){
                if(error){
                  console.log(error)
                }
                else if(docs[0].hasOwnProperty('facultyid') == false){
                  bot.sendMessage(msg.chat.id,"Your faculty is not registered.You can able to communicate with him,Once your faculty got registered")
                }
                else{
                  chatmessage.downloadVideoFromMessage(msg,function(error,filepath){
                    if(error){
                      console.log(error)
                    }
                    else if(filepath == "Bad Request: file is too big"){
                      //chatmessage.sendTextToFaculty(bot,docs[0].facultyid,reg,msg)
                      bot.sendMessage(msg.chat.id,filepath);
                    }
                    else{
                      chatmessage.sendVideoToFaculty(bot,docs[0].facultyid,reg,filepath)
                    }
                  })
                }
              })
            }
          })
        }
      })  
    }
    else if(type=='audio'){
      console.log(msg)
      var fromid = msg.chat.id;
      var jsonrow={'chatid': fromid}
      db.isRegisteredUser(fromid,function(error,docs){
        if(error){
          console.log(error)
        }
        else{
          var info = docs[0];
          db.findUserType(info,function(userType){
            if(userType=='faculty'){
              db.findStudentsForFaculty(fromid,function(error,regnos){
                if(error){
                  console.log(error)
                }
                else{
                  //console.log(regnos);
                  db.findStudentIds(regnos,function(error,docs){
                    if(error){
                      console.log(error)
                    }
                    else if(docs.length == 0){
                      bot.sendMessage(msg.chat.id,"None of your students are registered.You can start sending messages if atleast one of them are registered.")
                    }
                    else{
                        chatmessage.downloadAudioFromMessage(msg,function(error,filepath){
                          if(error){
                            console.log(error)
                          }
                          else if(filepath == "Bad Request: file is too big"){
                            //chatmessage.sendTextToStudents(bot,docs,msg)
                            bot.sendMessage(msg.chat.id,filepath);
                          }
                          else{
                            chatmessage.sendAudioToStudents(bot,docs,filepath)
                          }
                        })
                      }
                  })
                }
              })
            }
            else if(userType=='student'){
              var reg = info.regdno;
              db.findFacultyForStudent(reg,function(error,docs){
                if(error){
                  console.log(error)
                }
                else if(docs[0].hasOwnProperty('facultyid') == false){
                  bot.sendMessage(msg.chat.id,"Your faculty is not registered.You can able to communicate with him,Once your faculty got registered")
                }
                else{
                  chatmessage.downloadAudioFromMessage(msg,function(error,filepath){
                    if(error){
                      console.log(error)
                    }
                    else if(filepath == "Bad Request: file is too big"){
                      //chatmessage.sendTextToFaculty(bot,docs[0].facultyid,reg,msg)
                      bot.sendMessage(msg.chat.id,filepath);
                    }
                    else{
                      chatmessage.sendAudioToFaculty(bot,docs[0].facultyid,reg,filepath)
                    }
                  })
                }
              })
            }
          })
        }
      })  
    }
    else if(type=='location'){
      console.log(msg)
      var fromid = msg.chat.id;
      var jsonrow={'chatid': fromid}
      db.isRegisteredUser(fromid,function(error,docs){
        if(error){
          console.log(error)
        }
        else{
          var info = docs[0];
          db.findUserType(info,function(userType){
            if(userType=='faculty'){
              db.findStudentsForFaculty(fromid,function(error,regnos){
                if(error){
                  console.log(error)
                }
                else{
                  //console.log(regnos);
                  db.findStudentIds(regnos,function(error,docs){
                    if(error){
                      console.log(error)
                    }
                    else if(docs.length == 0){
                      bot.sendMessage(msg.chat.id,"None of your students are registered.You can start sending messages if atleast one of them are registered.")
                    }
                    else{
                      //console.log(docs)
                      //console.log(msg)
                      var latit = msg.location.latitude;
                      var long = msg.location.longitude;
                      docs.forEach(function(element){
                        var id = element.chatid;
                        var str = "Your Faculty sent:\n";
                        bot.sendMessage(id,str);
                        bot.sendLocation(id,latit,long)
                      });
                      //console.log("Location sent") 
                    }
                  })
                }
              })
            }
            else if(userType=='student'){
              var reg = info.regdno;
              db.findFacultyForStudent(reg,function(error,docs){
                if(error){
                  console.log(error)
                }
                else if(docs[0].hasOwnProperty('facultyid') == false){
                  bot.sendMessage(msg.chat.id,"Your faculty is not registered.You can able to communicate with him,Once your faculty got registered")
                }
                else{
                  var latit = msg.location.latitude;
                  var long = msg.location.longitude;
                  var id = docs[0].facultyid;
                  var str = reg + " sent:\n";
                  bot.sendMessage(id,str)
                  bot.sendLocation(id,latit,long)
                  //console.log("Location sent");
                }
              })
            }
          })
        }
      })  
    }
    else if(type=='contact'){
      console.log(msg)
      var fromid = msg.chat.id;
      var jsonrow={'chatid': fromid}
      db.isRegisteredUser(fromid,function(error,docs){
        if(error){
          console.log(error)
        }
        else{
          var info = docs[0];
          db.findUserType(info,function(userType){
            if(userType=='faculty'){
              db.findStudentsForFaculty(fromid,function(error,regnos){
                if(error){
                  console.log(error)
                }
                else{
                  //console.log(regnos);
                  db.findStudentIds(regnos,function(error,docs){
                    if(error){
                      console.log(error)
                    }
                    else if(docs.length == 0){
                      bot.sendMessage(msg.chat.id,"None of your students are registered.You can start sending messages if atleast one of them are registered.")
                    }
                    else{
                      //console.log(docs)
                      //console.log(msg)
                      var num = msg.contact.phone_number;
                      var name;
                      if((msg.contact.first_name).length != 0){
                            name = msg.contact.first_name;
                      }
                      else{
                        name = msg.contact.last_name;
                      }
                      docs.forEach(function(element){
                        var id = element.chatid;
                        var str = "Your Faculty sent:\n";
                        bot.sendMessage(id,str);
                        bot.sendContact(id,num,name)
                      });
                      //console.log("Contact sent") 
                    }
                  })
                }
              })
            }
            else if(userType=='student'){
              var reg = info.regdno;
              db.findFacultyForStudent(reg,function(error,docs){
                if(error){
                  console.log(error)
                }
                else if(docs[0].hasOwnProperty('facultyid') == false){
                  bot.sendMessage(msg.chat.id,"Your faculty is not registered.You can able to communicate with him,Once your faculty got registered")
                }
                else{
                  var num = msg.contact.phone_number;
                  var name;
                  if((msg.contact.first_name).length != 0){
                    name = msg.contact.first_name;
                  }
                  else{
                    name = msg.contact.last_name;
                  }
                  //console.log(name);
                  var id = docs[0].facultyid;
                  var str = reg + " sent:\n";
                  bot.sendMessage(id,str)
                  bot.sendContact(id,num,name);
                  //console.log("Contact sent");
                }
              })
            }
          })
        }
      })  
    }
    else if(type=='document'){
      console.log(msg)
      var fromid = msg.chat.id;
      var jsonrow={'chatid': fromid}
      db.isRegisteredUser(fromid,function(error,docs){
        if(error){
          console.log(error)
        }
        else{
          var info = docs[0];
          db.findUserType(info,function(userType){
            if(userType=='faculty'){
              db.findStudentsForFaculty(fromid,function(error,regnos){
                if(error){
                  console.log(error)
                }
                else{
                  //console.log(regnos);
                  db.findStudentIds(regnos,function(error,docs){
                    if(error){
                      console.log(error)
                    }
                    else if(docs.length == 0){
                      bot.sendMessage(msg.chat.id,"None of your students are registered.You can start sending messages if atleast one of them are registered.")
                    }
                    else{
                        chatmessage.downloadDocumentFromMessage(msg,function(error,filepath){
                          if(error){
                            console.log(error)
                          }
                          else if(filepath == "Bad Request: file is too big"){
                            //chatmessage.sendTextToStudents(bot,docs,msg)
                            //console.log("got error else ")//Sir in chatmessage itself we are not getting description sir.
                            bot.sendMessage(fromid,filepath);
                          }
                          else{
                            chatmessage.sendDocumentToStudents(bot,docs,filepath)
                          }
                        })
                      }
                  })
                }
              })
            }
            else if(userType=='student'){
              var reg = info.regdno;
              db.findFacultyForStudent(reg,function(error,docs){
                if(error){
                  console.log(error)
                }
                else if(docs[0].hasOwnProperty('facultyid') == false){
                  bot.sendMessage(msg.chat.id,"Your faculty is not registered.You can able to communicate with him,Once your faculty got registered")
                }
                else{
                  chatmessage.downloadDocumentFromMessage(msg,function(error,filepath){
                    if(error){
                      console.log(error)
                    }
                    else if(filepath == "Bad Request: file is too big"){
                      //chatmessage.sendTextToFaculty(bot,docs[0].facultyid,reg,msg)
                      bot.sendMessage(msg.chat.id,filepath);
                    }
                    else{
                      chatmessage.sendDocumentToFaculty(bot,docs[0].facultyid,reg,filepath)
                    }
                  })
                }
              })
            }
          })
        }
      })  
    }
  })   
})
            
bot.on("polling_error",(err)=>console.log(err));

//facutly registration -1

/*bot.onText(/ALL/,function(msg){
  var message = msg.text; //lets try to deploy now will check. ok sir.
  var fromid = msg.chat.id;
  db.dbobject.details.find({"facultyid":fromid},function(error,docs){
    if(error){
      console.log(error)
    }
    else{
      docs.forEach(function(element){
        var chatid = element.regdno;
        db.dbobject.ids.find({"regdno":chatid},function(err,docs){
          if(error){
            console.log(error)
          }
          else{
            var id = docs[0].chatid;
            bot.sendMessage(id,msg.text);
          }
        })
      })
    }
  })
})*/

/*bot.onText(/AllfacultY/,function(msg){
  var message = msg.text;
  var fromid = msg.chat.id;
  db.dbobject.faculty.find({},function(error,docs){
    if(error){
      console.log(error)
    }
    else{
      docs.forEach(function(element){
        var chatid = element.facultyid;
        if(chatid != fromid){
          bot.sendMessage(chatid,message);
        }
      })
    }
  })
})

bot.onText(/Faculty/,function(msg){
  var message = msg.text;
  var fromid = msg.chat.id;
  db.dbobject.ids.find({"chatid":fromid},function(error,docs){
    //console.log(docs);
    if(error){
      console.log(error);
    }
    else{
      var num = docs[0].regdno;
      //console.log(num);
      db.dbobject.details.find({"regdno":num},function(error,docs){
        //console.log(docs)
        if(error){
          console.log(error)
        }
        else{
          var fid = docs[0].facultyid;
          ////console.log(fid);
          bot.sendMessage(fid,"hai");
        }
      })
    }
  });
});*/

module.exports = router;