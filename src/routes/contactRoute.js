import rest from '../controllers/contactController';

const contactRoute = (app) => {
  app
    .route('/contact')
    .get(rest.findAll)
    .post(rest.create);

  app
    .route('/contact/:id')
    .put(rest.update)
    .delete(rest.remove);
};

export default contactRoute;
