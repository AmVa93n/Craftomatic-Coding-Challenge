module.exports = (app) => {
    app.use((req, res, next) => {
      // middleware that runs whenever requested page is not available
      res.status(404).json({ message: "This route does not exist" });
    });
  
    app.use((err, req, res, next) => {
      // middleware that handles the error whenever next(err) is called
      console.error("ERROR", req.method, req.path, err);
  
      // only render if the error ocurred before sending the response
      if (!res.headersSent) {
        res.status(500).json({
          message: "Internal server error. Check the server console",
        });
      }
    });
  };