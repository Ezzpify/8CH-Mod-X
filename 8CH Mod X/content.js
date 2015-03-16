var newurl;
if(window.document.title.indexOf("-") > -1)
{
	/*Force mod.php*/
	//Get current url
	var curUrl = window.location.href;

	//Check if we're already on mod.php? and if we're at the catalog, else refresh for mod.php?
	if(curUrl.indexOf("mod.php?") == -1 && curUrl.indexOf("catalog.html") == -1)
	{
    	newUrl = curUrl.replace("8ch.net", "8ch.net/mod.php?");
  		chrome.extension.sendRequest({redirect: newUrl});
    }

   	/*multi delete*/
   	//Check if we're in a thread
   	if(curUrl.indexOf("/res/") > -1) 
	{
		//Split tab title to get current board
		var TabTitle = window.document.title.split('-');
		var board = TabTitle[0].replace("/", "").replace("/ ", "");

		//Find the control span of all posts ([S+] [D] [D+] [B] [B&D] [Edit])
	    var divs = document.querySelectorAll('span.controls'), i;
		for (i = 0; i < divs.length; ++i) 
		{
			//Check if edit exists, otherwise it's IMAGE controls, and we don't care about that
			if(divs[i].innerHTML.indexOf("[Edit]") > -1)
			{
				//Get postID and ConfirmID from post
				var s1 = divs[i].innerHTML.split('delete/');
				var s2 = s1[1].split('\'');
				var postID = s2[0];

				//Create a checkbox for each post by the control
				var checkbox = document.createElement('input');
				checkbox.type = "checkbox";
				checkbox.name = "pcb";
				checkbox.value = "pcb" + postID;
				checkbox.id = "pcb" + postID;
				divs[i].appendChild(checkbox);
			}
		}

		//Add Delete checked posts hyperlink at the bottom of the page
		var b = document.querySelector('span#thread-links');
		var para = document.createElement("a");
		para.innerHTML = "[Delete checked posts]";
		para.onclick = function () 
		{
			//Get all checkboxes by name pcb (our checkboxes)
		    var chk_arr =  document.getElementsByName("pcb");
			var chklength = chk_arr.length;
			var PostArr = new Array();

			//Loop through each checkbox
			for(i = 0; i < chklength; i++)
			{
				//If it's checked
				if(chk_arr[i].checked)
				{
					//remove pcb from value and only keep 'postid/confirmid' and add to array
					var CBValues = chk_arr[i].value.replace("pcb", "");
					PostArr.push(CBValues);
				}
			}

			//Check so array isn't empty (no checked checkboxes)
			if(PostArr.length == 0)
			{
				alert("No posts selected");
				return;
			}

			//Loop through array
			for(i = 0; i < PostArr.length; i++)
			{
				//PostArr format = POSTID/CONFIRMID
				//Split array item into vals[0] = postID vals[1] = confirmID
				var vals = PostArr[i].split('/');
				//format delete url
				var DeleteURL = "http://8ch.net/mod.php?/" + board + "/delete/" + vals[0] + "/" + vals[1];

				//Add an 1px iframe at the bottom of the page and load the delete url
				var ifrm = document.createElement("IFRAME");
				ifrm.style.width = "1px";
				ifrm.style.height = "1px";
				ifrm.src = DeleteURL;
				ifrm.onload = function () 
				{
					document.body.removeChild(ifrm);
				}
				document.body.appendChild(ifrm); 
				//window.open(DeleteURL, "_blank");
			}
			para.innerHTML = "[Deleting... wait for page for finish loading, then reload page]"
		};
		para.style.cssText = "padding-left: 10px; font-size: 13.5px";
		b.appendChild(para);    
	}
}