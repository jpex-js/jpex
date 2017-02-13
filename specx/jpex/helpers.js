(function(){
	beforeEach(function(){
		Object.keys(require.cache)
		.forEach(function(k){
			delete require.cache[k];
		});
	});
})();