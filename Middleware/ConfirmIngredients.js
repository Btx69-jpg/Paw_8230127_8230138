async function confirmNutritionalData(req, res, next) {
  if (req.body.warnings && req.body.warnings.length > 0) {
    req.session.tempDishData = req.body;

    return res.render('confirm-nutrition', {
      warnings: req.body.warnings,
      dishData: req.body
    });
  }
  next();
}
  
// Use o middleware na rota de salvamento
app.post('/save-menu', confirmNutritionalData, menuController.saveMenu);