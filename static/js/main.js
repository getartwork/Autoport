// Contains state of searching operations
var searchState = {
	sorting: "relevance",
	ready: false, // Whether or not to draw this view
	query: "", // User's query
	results: {}, // Search result data
	changeSort: function (ev) { // Called upon changing sort type
		searchState.sorting = $(ev.target).text().toLowerCase();
		doSearch();
	},
	queryTop: {
		limit:    25,
		sort:     "stars",
		language: "any",
		version:  "current",
		stars:    0,
		forks:    0,
		generate: function (ev) {
			// TODO: remove redundant query qualifiers (stars/forks == 0)
			var data = {
				// GitHub API parameters
				q:       " stars:>" + searchState.queryTop.stars +
						 " forks:>" + searchState.queryTop.forks +
						 (searchState.queryTop.language == "any" ? "" : (" language:" + searchState.queryTop.language)),
				sort:    searchState.queryTop.sort,

				// AutoPort parameters
				limit:   searchState.queryTop.limit,
				version: searchState.queryTop.version
			};

			console.log(data);
			switchToLoadingState();
			$.getJSON("/search/repositories", data, processSearchResults);
		}
	}
};

var batchState = {
    currentBatchFile: "",
    selectBatchFile: function (ev) {
        batchState.currentBatchFile = $(ev.target).text();
        console.log(batchState.currentBatchFile);
    },
    listBatchFiles: function (ev) {
	    $.post("/listBatchFiles", {}, listBatchFilesCallback, "json");
    },
    upload: function (ev) {
        //Why do I need the [0] in the jQuery but not the getElementByID, those should be equivalent?
        //var file = document.getElementById('batch_file').files[0];
        var file = $('#batch_file')[0].files[0]; 
        
        if (file) {
            var reader = new FileReader();
            reader.readAsText(file);
		
            reader.onload = function(e) {
                $.post("/uploadBatchFile", {file: e.target.result}, uploadBatchFileCallback, "json");
            };	
        }
    },
    build: function (ev) {
        console.log("In batchState.build");
    },
    buildAndTest: function (ev) { 
        console.log("In batchState.buildAndTest");
	    $.post("/runBatchFile", {batchName: batchState.currentBatchFile}, runBatchFileCallback, "json");
    },
    ready: false, // Whether or not to draw the batch file view
    batchFile: {
        config:   {},
        packages: []
    },
    download: function (ev) {
        var json = JSON.stringify(batchState.batchFile, undefined, 2);
        var data = "data: application/octet-stream;charset=utf-8," + encodeURIComponent(json);
        window.open(data);
    }
};

// Contains state of loading view
var loadingState = {
	loading: false // Whether or not to draw this view
}
// Contains state of detail view
var detailState = {
	ready: false,
	repo: null, // Repo data
	autoSelected: false, // Was this repository autoselected from search query?
	pie: null, // Pie chart
	javaTypex86: "", // Open JDK or IBM Java
	javaTypeLE:"",
	backToResults: function() {
		detailState.ready = false;
		searchState.ready = true;
	},
	exitAutoSelect: function() {
		doSearch(false);
	},
	// When the radio button is pressed update the server environment data
	selectJavaType:	function() {
    	var radio = document.getElementById('radio');
    	if (!document.getElementById('option1').checked) {
    		detailState.javaTypex86 = "";
    		detailState.javaTypeLE = "";
    	}
    	else if (!document.getElementById('option2').checked) {
    		detailState.javaTypex86 = "JAVA_HOME=/opt/ibm/java-x86_64-71";
    		detailState.javaTypeLE = "JAVA_HOME=/opt/ibm/java-ppc64le-71";
    	}
	}
}

// Rivets.js bindings
// Allows user to change sorting method
rivets.bind($('#listBox'), {
	batchState: batchState
});
rivets.bind($('#searchBox'), {
	searchState: searchState
});
rivets.bind($('#fileUploadBox'), {
    batchState: batchState
});
rivets.bind($('#buildAndTestBox'), {
    batchState: batchState
});
rivets.bind($('#generateBox'), {
    searchState: searchState
});
// Multiple result alert box
rivets.bind($('.multiple-alert'), {
	searchState: searchState
});
// Autoselect alert box
rivets.bind($('.autoselect-alert'), {
	detailState: detailState
});
// Hides / shows loading panel
rivets.bind($('#loadingPanel'), {
	loadingState: loadingState
});
// Hides / shows results panel
rivets.bind($('#resultsPanel'), {
	searchState: searchState
});
// Hides / shows detail panel
rivets.bind($('#detailPanel'), {
	detailState: detailState
});
// Populates results table
rivets.bind($('#resultsTable'), {
	searchState: searchState
});
// Hides / shows batch file panel
rivets.bind($('#batchFilePanel'), {
	batchState: batchState
});
// Populates batch file table
rivets.bind($('#batchFileTable'), {
	batchState: batchState
});

// Disables all views except loading view
function switchToLoadingState() {
	searchState.ready = false;
	detailState.ready = false;
	loadingState.loading = true;
	detailState.autoSelected = false;
}

// Does the above and makes a search query
function doSearch(autoselect) {
	if(typeof(autoselect)==='undefined') autoselect = true;
	if(typeof(autoselect)!=='boolean') autoselect = true;
	
	// Do not switch to loading state if query is empty
	searchState.query = $('#query').val();
	if(searchState.query.length > 0) {
		switchToLoadingState();
		$.getJSON("/search", {
			q: searchState.query,
			sort: searchState.sorting,
			auto: autoselect
		}, processSearchResults);
	}
}

// When the query textbox is changed, do a search
$('#query').change(doSearch);

$('#batch_file').change(function () {
    $('#uploadFilename').val("File selected:  " + $('#batch_file').val());
});

// Callback for when we recieve data from a search query request
function processSearchResults(data) {
	if(data.status !== "ok") {
		console.log("Bad response from /search!");
		console.log(data);
	} else if (data.type === "multiple") {
		// Got multiple results
		// Add select function to each result
		data.results.forEach(function(result) {
			// Show detail view for repo upon selection
			result.select = function () {
				$.get("/detail/" + result.id, showDetail);
				switchToLoadingState();
			};
			result.addToBatchFile = function () {
				batchState.batchFile.packages.push(result);
				batchState.ready = true;
			};
		});
		detailState.autoSelected = false;
		searchState.results = data.results;
		loadingState.loading = false;
		searchState.ready = true;
	} else if (data.type === "detail") {
		// Got single repository result, show detail page
		detailState.autoSelected = true;
		showDetail(data);
	}
}

// Sets up and opens detail view for a repo
// TODO - add check boxes for architectures wanted
function showDetail(data) {
	if(data.status !== "ok" || data.type !== "detail") {
		console.log("Bad response while creating detail view!");
	} else {
		detailState.repo = data.repo;
		detailState.repo.addToJenkins = function(e) {
			$.post("/createJob", {id: detailState.repo.id, tag: e.target.innerHTML, javaTypex86: detailState.javaTypex86, arch: "x86"}, addToJenkinsCallback, "json");
			$.post("/createJob", {id: detailState.repo.id, tag: e.target.innerHTML, javaTypeLE: detailState.javaTypeLE, arch: "ppcle"}, addToJenkinsCallback, "json");
		};
		loadingState.loading = false;
		detailState.ready = true;
		// Make chart
		var ctx = $("#langChart").get(0).getContext("2d");
		if(detailState.pie !== null) {
			detailState.pie.destroy();
		}
		detailState.pie = new Chart(ctx).Pie(detailState.repo.languages, {
			segmentShowStroke: false
		});
		legend(document.getElementById('langLegend'), detailState.repo.languages)
	}
}

function uploadBatchFileCallback(data) {
    console.log("In uploadBatchFileCallback");
}

function runBatchFileCallback(data) {
    console.log("In runBatchFileCallback");
}

function listBatchFilesCallback(data) {
    if(data.status === "ok") {
        var file_list = data.files;
    
        for(var i = 0; i < file_list.length; i++) {
            $("#listBox").append("<div rv-on-click=\"batchState.selectBatchFile\"" + 
                "class=\"btn btn-primary list-batch-btn\">" + file_list[i] + "</div>");
        }
        
        rivets.bind($('.list-batch-btn'), {
            batchState: batchState
        });
    }
}

function addToJenkinsCallback(data) {
    // TODO - need to take in a list of sjobUrls and hjobUrls and then iterate over the list
	if(data.status === "ok") {
		// Open new windows with the jobs' home pages
		window.open(data.hjobUrl,'_blank');
	} else {
		console.log("Bad response from /createJob!");
		console.log(data);
	}
}
