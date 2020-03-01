import Contact from '../models/contact';

const handleError = (error, response) => {
  response.status((error && error.code) || 400);
  response.send(error);
};

const create = (req, res) => {
  const newType = new Contact(req.body.contact);
  newType.save((err, created) => {
    if (err) {
      handleError(err, res);
    } else {
      res.json(created);
    }
  });
};

const findAll = (req, res) => Contact.find({}).sort({ name: 1 })
  .then((resp) => res.json(resp))
  .catch((err) => handleError(err, res));

const remove = (req, res) => Contact.remove({ _id: req.params.id })
  .then((resp) => res.json(resp))
  .catch((err) => handleError(err, res));

const update = (req, res) => Contact.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
  .then((resp) => res.json(resp))
  .catch((err) => handleError(err, res));

const rest = {
  create,
  findAll,
  remove,
  update,
};

export default rest;
