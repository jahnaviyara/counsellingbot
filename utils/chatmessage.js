var request=require('request')
var fs=require('fs')

var findMessageType=function(msg,callbackfunc){
    if(msg.text=='/start'){
        callbackfunc('/start')
    }
    else if(msg.hasOwnProperty('photo')){
        callbackfunc('photo')
    }
    else if(msg.hasOwnProperty('document')){
        callbackfunc('document')
    }
    else if(msg.hasOwnProperty('video')){
        callbackfunc('video')
    }
    else if(msg.hasOwnProperty('audio')){
        callbackfunc('audio')
    }
    else if(msg.hasOwnProperty('location')){
        callbackfunc('location')
    }
    else if(msg.hasOwnProperty('contact')){
        callbackfunc('contact')
    }
    else{
        callbackfunc('text') //thhis error text block is executed
    }
}
var downloadFile = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
      //console.log('content-type:', res.headers['content-type']);
      //console.log('content-length:', res.headers['content-length']);
  
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
  };
  
var downloadPhotoFromMessage=function(msg,callbackfunc){
    var file_id=msg.photo[0].file_id
    const url='https://api.telegram.org/bot866791240:AAFrS0epP3WqHRSQv5Pz0e0KwC0v9C6DS2k/getFile?file_id='+file_id
    request({ url: url,json:true }, function(error, response)  {
    if(error){
        callbackfunc(error,null)
    }
    else{
        //var data = response.body   
        console.log(response.body)
        var relurl=response.body.result.file_path
        //console.log(relurl)
        var imgurl='https://api.telegram.org/file/bot866791240:AAFrS0epP3WqHRSQv5Pz0e0KwC0v9C6DS2k/'+relurl
        //console.log(imgurl)
        downloadFile(imgurl, relurl, function(){
            callbackfunc(null,relurl)
        });
    }
  })
}

var downloadVideoFromMessage=function(msg,callbackfunc){
    var file_id=msg.video.file_id
    const url='https://api.telegram.org/bot866791240:AAFrS0epP3WqHRSQv5Pz0e0KwC0v9C6DS2k/getFile?file_id='+file_id
    request({ url: url,json:true }, function(error, response)  {
    if(error){
        callbackfunc(error,null)  
    }
    else{
        //var data = response.body   
        console.log(response.body)
        var ok = response.body.ok
        //console.log(ok)
        if(ok){
        var relurl=response.body.result.file_path
        //console.log(relurl)
        var imgurl='https://api.telegram.org/file/bot866791240:AAFrS0epP3WqHRSQv5Pz0e0KwC0v9C6DS2k/'+relurl
        //console.log(imgurl)
        downloadFile(imgurl, relurl, function(){
            callbackfunc(null,relurl)
        });
        }
        else{
            var des = response.body.description;
            //console.log(des)
            callbackfunc(null,des)
        }
    }
  })
}
var downloadAudioFromMessage=function(msg,callbackfunc){
    var file_id=msg.audio.file_id
    const url='https://api.telegram.org/bot866791240:AAFrS0epP3WqHRSQv5Pz0e0KwC0v9C6DS2k/getFile?file_id='+file_id
    request({ url: url,json:true }, function(error, response)  {
    if(error){
        callbackfunc(error,null)
    }
    else{
        //var data = response.body 
        var ok = response.body.ok
        //console.log(ok)  
        console.log(response.body)
        if(ok){
        var relurl=response.body.result.file_path
        //console.log(relurl)
        var imgurl='https://api.telegram.org/file/bot866791240:AAFrS0epP3WqHRSQv5Pz0e0KwC0v9C6DS2k/'+relurl
        //console.log(imgurl)
        downloadFile(imgurl, relurl, function(){
            callbackfunc(null,relurl)
        });
        }
        else{
            var des = response.body.description;
            //console.log(des)
            callbackfunc(null,des)
        }
    }
  })
}
var downloadDocumentFromMessage=function(msg,callbackfunc){
    var file_id=msg.document.file_id
    var filename = msg.document.file_name
    const url='https://api.telegram.org/bot866791240:AAFrS0epP3WqHRSQv5Pz0e0KwC0v9C6DS2k/getFile?file_id='+file_id
    request({ url: url,json:true }, function(error, response)  {
    if(error){
        callbackfunc(error,null)
    }
    else{
        //var data = response.body   
        //console.log(response.body)
        var ok = response.body.ok
        //console.log(ok)
        if(ok){
        var relurl=response.body.result.file_path
        var diskpath='./documents/'+filename
        diskpath=diskpath.replace(' ','_')
        //console.log(relurl)
        var imgurl='https://api.telegram.org/file/bot866791240:AAFrS0epP3WqHRSQv5Pz0e0KwC0v9C6DS2k/'+relurl
        //console.log(imgurl)
        downloadFile(imgurl, diskpath, function(){
            callbackfunc(null,diskpath)
        });
        }
        else{
            console.log("ok false")
            var des = response.body.description;
            //console.log(des)
            callbackfunc(null,des)
        }
    }
  })
}


var sendPhotoToStudents=function(bot,docs,filepath){
    docs.forEach(function(element){
        var id = element.chatid;
        var str = "Your Faculty sent:\n";
        bot.sendMessage(id,str);
        bot.sendPhoto(id, './'+filepath);
      });
}

var sendVideoToStudents=function(bot,docs,filepath){
    docs.forEach(function(element){
        var id = element.chatid;
        var str = "Your Faculty sent:\n";
        bot.sendMessage(id,str);
        bot.sendVideo(id, './'+filepath);
      });
}
var sendAudioToStudents=function(bot,docs,filepath){
    docs.forEach(function(element){
        var id = element.chatid;
        var str = "Your Faculty sent:\n";
        bot.sendMessage(id,str);
        bot.sendAudio(id, './'+filepath);
      });
}
var sendDocumentToStudents=function(bot,docs,filepath){
    docs.forEach(function(element){
        var id = element.chatid;
        var str = "Your Faculty sent:\n";
        bot.sendMessage(id,str);
        bot.sendDocument(id, filepath);
      });
}
var sendTextToStudents=function(bot,docs,msg){
    var str = "Your Faculty wrote:\n" + msg.text;
    docs.forEach(function(element){
        var id = element.chatid;
        bot.sendMessage(id,str);//sending message to students
      })
}
var sendPhotoToFaculty=function(bot,facultyid,reg,filepath){
    var str = reg + " sent:\n";
    bot.sendMessage(facultyid,str);
    bot.sendPhoto(facultyid, './'+filepath)
}
var sendVideoToFaculty=function(bot,facultyid,reg,filepath){
    var str = reg + " sent:\n";
    bot.sendMessage(facultyid,str);
    bot.sendVideo(facultyid, './'+filepath)
}
var sendAudioToFaculty=function(bot,facultyid,reg,filepath){
    var str = reg + " sent:\n";
    bot.sendMessage(facultyid,str);
    bot.sendAudio(facultyid, './'+filepath)
}
var sendDocumentToFaculty=function(bot,facultyid,reg,filepath){
    var str = reg + " sent:\n";
    bot.sendMessage(facultyid,str);
    bot.sendDocument(facultyid, filepath);
}
var sendTextToFaculty=function(bot,facultyid,reg,msg){
    var str = reg + " wrote:\n" + msg.text;
    bot.sendMessage(facultyid,str);//student sending message to corresponding faculty
}


module.exports.findMessageType=findMessageType;
module.exports.downloadPhotoFromMessage=downloadPhotoFromMessage;
module.exports.sendPhotoToStudents=sendPhotoToStudents;
module.exports.sendPhotoToFaculty=sendPhotoToFaculty;
module.exports.sendTextToStudents=sendTextToStudents;
module.exports.sendTextToFaculty=sendTextToFaculty;
module.exports.downloadVideoFromMessage=downloadVideoFromMessage;
module.exports.downloadAudioFromMessage=downloadAudioFromMessage;
module.exports.downloadDocumentFromMessage=downloadDocumentFromMessage;
module.exports.sendVideoToStudents=sendVideoToStudents;
module.exports.sendVideoToFaculty=sendVideoToFaculty;
module.exports.sendAudioToStudents=sendAudioToStudents;
module.exports.sendAudioToFaculty=sendAudioToFaculty;
module.exports.sendDocumentToStudents=sendDocumentToStudents;
module.exports.sendDocumentToFaculty=sendDocumentToFaculty;