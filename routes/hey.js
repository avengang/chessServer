
/* hey page. */
router.get('/hey', function(req, res, next) {
  	res.render('hey', { title: 'Express' });
});

