var response, multi1,multi2, multi3;
setTimeout(function(){
    if(document.getElementById('subid')!=null){
        var xhrrequestartist=new XMLHttpRequest()
        xhrrequestartist.onload=function(){
            response=JSON.parse(xhrrequestartist.response);
        }   
        xhrrequestartist.open('GET',"/ide/submission/"+ document.getElementById('subid').innerText.substr(14)+"/getdata", false)
        xhrrequestartist.send();
        console.log(response)
        if(response.input!=""){
            for(var i=0;i<response.input.length;i++)
            multi3+=response.input[i];
            multi3=multi3.substr(9)
            multi3.replace(/\n/ig, '');
            multi3=multi3.split('')
            for(var i=0;i<multi3.length;i++){
                if(multi3[i]!="")
                document.getElementsByTagName('textarea')[0].value+=multi3[i]
            }
             
            var temp2=document.getElementsByTagName('textarea')[0].value.split("")
            console.log(temp2)
            for(var i=0;i<temp2.length;i++){
                if(temp2[i]=="\n"&&temp2[i+1]=="\n"){
                    delete temp2[i];
                }
            }
            document.getElementsByTagName('textarea')[0].value=""
            for(var i=0;i<temp2.length;i++)
            document.getElementsByTagName('textarea')[0].value+=temp2[i];
            document.getElementsByTagName('textarea')[0].value=document.getElementsByTagName('textarea')[0].value.replace(/undefined/ig, '');       
        }
        for(var i=0;i<response.code.length;i++)
        multi1+=response.code[i];
        for(var i=0;i<response.result.length;i++)
        multi2+=response.result[i];
        multi1=multi1.substr(9)
        multi1.replace(/\n/ig, '');
        multi1=multi1.split('')
        multi2=multi2.substr(9)
        multi2.replace(/\n/ig, '');
        multi2=multi2.split('')
        for(var i=0;i<multi1.length;i++){
            if(multi1[i]!="")
            document.getElementsByTagName('textarea')[2].value+=multi1[i]
            else{
                document.getElementsByTagName('textarea')[2].value+="\n"
            }
        }
        document.getElementsByTagName('textarea')[2].value=document.getElementsByTagName('textarea')[2].value.replace(/↵↵/g,'↵')
        for(var i=0;i<multi2.length;i++){
            if(multi2[i]!="")
            document.getElementsByTagName('textarea')[1].value+=multi2[i]
            else{
                document.getElementsByTagName('textarea')[1].value+="\n"
            }
        }

        temp=document.getElementsByTagName('textarea')[2].value.split("")
        for(var i=0;i<temp.length;i++){
            if(temp[i]=="\n"&&temp[i+1]=="\n"){
                delete temp[i];
            }
        }
        document.getElementsByTagName('textarea')[2].value=""
        for(var i=0;i<temp.length;i++)
        document.getElementsByTagName('textarea')[2].value+=temp[i];
        document.getElementsByTagName('textarea')[2].value=document.getElementsByTagName('textarea')[2].value.replace(/undefined/ig, '');
}
},10000)