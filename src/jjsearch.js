/*
 *  jjsearch.js - v1.0.0
 *  lite search engine writen in JS to process JSON
 *  https://github.com/EldonMcGuinness/jjsearch.js
 *
 *  Made by Eldon McGuinness
 *  Under MIT License
 *
 *  Parameters:
 *  
 *  TODO:
 *  Add documentation!
 *  Add Boolean &&
 */

var jjsearch = function(callback, source, hotlinking){
    //Enable and disable debugging
    this.qsdebug = false;
    
    // The HTML element's ID that we should pull the search
    // string from
    this.source = document.getElementById(source) || '';

    // The callback to fire when the searching is done
    this.callback = callback || null;

    // Context for "this", needed in hotlinking to refer to "this"
    var context = this;

    if (hotlinking){
        window.onload = function () {
            //Grab just the first instance of the "q" item
            var qs = jjsearch.querystring();
            //if (qsdebug == true) console.log(qs["q"]);
            if (typeof(qs["q"]) == "object"){
                qs = qs["q"][0];
            }else if (typeof(qs["q"]) == "string"){
                qs = qs["q"];
            }
            if (typeof(qs) == "string") {
                context.source.value = context.doSearch(qs);
            }
        };
    }

    // Collect the valid hits that match the search terms
    this.getHits = function(terms, json) {
        var hits = [];

        if (Array.isArray(terms)) {
            if (this.qsdebug == true) console.log("array found");
        } else {
            terms = terms.split("||");

            // Replace basic boolean objects
            terms = terms.map(function(n){
                 return n.replace(/\s*[\+|\*|\?]\s*/g, '.*');
            });

            // Trim all the terms to remove whitespace
            terms = terms.map(function(n){return n.trim();});

            if (this.qsdebug == true) console.log(terms);
            for (var i = 0; i < json.length; i++) {
                for (var j = 0; j < terms.length; j++) {
                    if (this.linkExists(json[i], hits)) {
                        break;
                    }
                    if (this.qsdebug == true) console.log("Counts ["+i+"]["+j+"]");
                    if (this.qsdebug == true) console.log("Checking Title ["+json[i]["title"]+"]["+terms[j]+"]");
                    if (json[i]["title"].search(new RegExp(terms[j], "i")) > -1 || json[i]["content"].search(new RegExp(terms[j], "i")) > -1) {
                        hits.push(json[i]);
                        break;
                    }
                }
            }

            if (this.qsdebug == true) console.log(hits);
            return hits;
        }
    };


    // check to see if the search link is already in the array
    this.linkExists = function(obj, arr) {
        if (this.qsdebug == true) console.log(obj);
        if (this.qsdebug == true) console.log(arr);
        for (var i = 0; i < arr.length; i++) {
            if (this.qsdebug == true) console.log("comparing"+obj["link"]+"|"+arr[i]["link"]);
            if (obj["link"] == arr[i]["link"]) {
                return true;
            }
        }
        return false;
    };


    // Populate the search results, this calls the callback
    this.populateResults = function(results){
        this.callback(results);
    };


    // Main search function, this is what triggers the search
    this.doSearch = function(str){

        var json = null;
        var terms = '';
        var context = this;
        var r = new XMLHttpRequest();

        // Check to see if we were given a valid id
        if (str == null){
            terms = this.source.value.trim();
        }else{
            terms = str;
        }
        
        //If the search query is less than 4 characters prompt for more
        if (terms.length < 4) {
            this.callback(1);
            return terms
        }

        r.open("GET", "/search.json", true);
        r.onreadystatechange = function () {
            if (r.readyState != 4 || r.status != 200) return;
            var hits = context.getHits(terms, JSON.parse(r.response));
            context.populateResults(hits);
        };
        r.send();
            
        return terms;
    };
};


// querystring function, borrowed from https://github.com/EldonMcGuinness/querystring.js
// This is used to parse the querystring and allow for hotlinking
// to search results
jjsearch.querystring = function(str) {
    var qso = {};
    var qs = (str || document.location.search);

    // Check for an empty querystring
    if (qs == ""){
        return qso;
    }
    
    // Normalize the querystring
    qs = qs.replace(/(^\?)/,'')
    .replace(/;/g,'&');
    while (qs.indexOf("&&") != -1){
        qs = qs.replace(/&&/g,'&');
    }
    qs = qs.replace(/([\&]+$)/,'');

    // Break the querystring into parts

    qs = qs.split("&");

    // Build the querystring object
    for (var i=0; i < qs.length; i++){
        var qi = qs[i].split("=");

        qi = map(qi, function (n) {return decodeURIComponent(n)});

        if (qso[qi[0]] != undefined){

            // If a key already exists then make this an object
            if (typeof(qso[qi[0]]) == "string"){
                var temp = qso[qi[0]];
                if (qi[1] == ""){
                    qi[1] = null;
                }
                //console.log("Duplicate key: ["+qi[0]+"]["+qi[1]+"]");
                qso[qi[0]] = [];
                qso[qi[0]].push(temp);
                qso[qi[0]].push(qi[1]);

            }else if (typeof(qso[qi[0]]) == "object"){
                if (qi[1] == ""){
                    qi[1] = null;
                }                    
                //console.log("Duplicate key: ["+qi[0]+"]["+qi[1]+"]");
                qso[qi[0]].push(qi[1]);
            }
        }else{
            // If no key exists just set it as a string
            if (qi[1] == ""){
                qi[1] = null;
            }                
            //console.log("New key: ["+qi[0]+"]["+qi[1]+"]");
            qso[qi[0]] = qi[1];
        }
    }

    function map(arr, func){
        for (var i=0; i<arr.length; i++ ){
            arr[i] = func(arr[i]);
        }
        return arr;
    }
    
    return qso;
};
