/*
Copyright (c) 2014 Intel Corporation.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of works must retain the original copyright notice, this list
  of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the original copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.
* Neither the name of Intel Corporation nor the names of its contributors
  may be used to endorse or promote products derived from this work without
  specific prior written permission.

THIS SOFTWARE IS PROVIDED BY INTEL CORPORATION "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL INTEL CORPORATION BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

Authors:
        Liu, Yun <yunx.liu@intel.com>
*/

var fileName;

var lstorage = window.localStorage;

function init() {
  txtSuite.innerHTML = lstorage.getItem("test-suite");
  var snum = parseInt(lstorage.getItem("setnum"));
  var totalnum = 0;
  var passnum = 0;
  var failnum = 0;
  var notrunnum = 0;
  var table = document.getElementById("resultDetail");
  var titleTr = document.createElement("tr");
  titleTr.style["background"] = "rgba(128, 128, 128, 0.64)";
  var tdcasetitle = document.createElement("td");
  var tdpasstitle = document.createElement("td");
  var tdfailtitle = document.createElement("td");
  var tdnotRuntitle = document.createElement("td");
  tdcasetitle.innerHTML = "Case_ID";
  tdpasstitle.innerHTML = "Pass";
  tdfailtitle.innerHTML = "Fail";
  tdnotRuntitle.innerHTML = "Not Run";
  titleTr.appendChild(tdcasetitle);
  titleTr.appendChild(tdpasstitle);
  titleTr.appendChild(tdfailtitle);
  titleTr.appendChild(tdnotRuntitle);
  table.appendChild(titleTr);
  for(var i = 0; i < snum; i++) {
    var sidres = "set" + (i + 1) + "res";
    var setarres = JSON.parse(lstorage.getItem(sidres));
    totalnum += parseInt(setarres.totalnum == "" ? 0 : setarres.totalnum);
    passnum += parseInt(setarres.passnum == "" ? 0 : setarres.passnum);
    failnum += parseInt(setarres.failnum == "" ? 0 : setarres.failnum);
    var setTr = document.createElement("tr");
    var sname = document.createElement("td");
    sname.setAttribute('colSpan', 4);
    sname.style["textAlign"] = "left";
    sname.style["background"] = "rgba(128, 128, 128, 0.16)";
    var sid = "set" + (i + 1);
    var setarr = JSON.parse(lstorage.getItem(sid));
    sname.innerHTML = "Test Set: " + setarr.name;
    setTr.appendChild(sname);
    table.appendChild(setTr);
    var tids = setarr.tids.split(',');
    for(var j = 0; j < tids.length; j++) {
      var caseTr = document.createElement("tr");
      var tdcaseId = document.createElement("td");
      var tdpass = document.createElement("td");
      var tdfail = document.createElement("td");
      var tdnotRun = document.createElement("td");
      var tid = tids[j];
      var casearr = JSON.parse(lstorage.getItem(tid));
      var tnum = parseInt(casearr.num);
      var tpass = parseInt(casearr.pass);
      var tfail = parseInt(casearr.fail);
      var tresult = casearr.result;
      tdcaseId.innerHTML = tid;      
      if(tnum > 1) {
        tdpass.innerHTML = tpass;
        tdfail.innerHTML = tfail;
        tdnotRun.innerHTML = tnum-tpass-tfail;
      } else {
        tdpass.innerHTML = tresult == "pass" ? 1 : 0;
        tdfail.innerHTML = tresult == "fail" ? 1 : 0;
        tdnotRun.innerHTML = tresult != "" ? 0 : 1;
      }
      caseTr.appendChild(tdcaseId);
      caseTr.appendChild(tdpass);
      caseTr.appendChild(tdfail);
      caseTr.appendChild(tdnotRun);
      table.appendChild(caseTr);
    } 
  }
  txtPassed.innerHTML = passnum;
  txtFailed.innerHTML = failnum;
  txtNotRun.innerHTML = totalnum - passnum - failnum;
  txtTotal.innerHTML = totalnum;
}

function downloadResult() {
  //exportTableToCSV.apply(this, [$('#resultDetail'), 'export.csv']);
  tizen.filesystem.resolve(
    'documents',
    function(dir) {
      documentsDir = dir; 
      dir.listFiles(createsuccess, onerror);
    }, function(e) {
      $("#popup_info").modal(showMessage("error", "Error: " + e.message));
    }, "rw");
}

function createsuccess(files) {
  fileName = "report.csv";
  if (files.length > 0) {
    for(var i = 0; i < files.length; i++) {
      if (files[i].isDirectory == false && files[i].name == fileName) {
        documentsDir.deleteFile(files[i].fullPath, function () {}, function(e) {
          $("#popup_info").modal(showMessage("error", "DeleteFile error: " + e.message));
        });
      }
    }
  }
  var testFile = documentsDir.createFile(fileName);
  if (testFile != null) {
    testFile.openStream(
      "w",
      function(fs) {
        var snum = parseInt(lstorage.getItem("setnum"));
        var resultReport = "Feature, Case Id, Test Case, Pass, Fail, N/A, Measured, Comment, Measurement Name, Value, Unit, Target, Failure\n";
        for(var i = 0; i < snum; i++) {
          var sid = "set" + (i + 1);
          var setarr = JSON.parse(lstorage.getItem(sid));
          var tids = setarr.tids.split(',');
          for(var j = 0; j < tids.length; j++) {
            var tid = tids[j];
            var casearr = JSON.parse(lstorage.getItem(tid));
            var tnum = parseInt(casearr.num);
            var tpass = parseInt(casearr.pass);
            var tfail = parseInt(casearr.fail);
            var tresult = casearr.result;
            resultReport += setarr.name + "," + tid + "," + casearr.purpose;      
            if(tnum > 1) {
              resultReport += "," + tpass + "," + tfail + "," + (tnum-tpass-tfail) + "\n";
            } else {
              var pass0 = tresult == "pass" ? 1 : 0;
              var fail0 = tresult == "fail" ? 1 : 0;
              var notrun0 = tresult != "" ? 0 : 1;
              resultReport += "," + pass0 + "," + fail0 + "," + notrun0 + "\n";
            }
          } 
        }
        fs.write(resultReport);
        fs.close();
        $("#popup_info").modal(showMessage("success", "Download 'report.csv' successfully! You can get it from '/home/app/content/Documents/'."));
      }, function(e) {
        $("#popup_info").modal(showMessage("error", "CreateFile error: " + e.message));
      }, "UTF-8");
  }
}

function onerror(error) {
  $("#popup_info").modal(showMessage("error", "The error " + error.message + " occurred when listing the files in the selected folder"));
}

$(document).ready(function(){
  document.getElementById('app-version').innerHTML = lstorage.getItem("app-version");
  $("#downloadResult").click(downloadResult);
  init();
});



