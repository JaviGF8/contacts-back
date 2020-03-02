import Contact from '../models/contact';

const create = (req, res) => {
  const newType = new Contact(req.body.contact);
  newType.save((error, created) => {
    if (error) {
      const err = {
        property: error.message.split(': ')[2].split('_1')[0],
        message: `Duplicated key ${error.message}`,
      };
      res.status(400);
      res.send(err);
    } else {
      res.json(created);
    }
  });
};

const findAll = (req, res) => Contact.find({}).sort({ name: 1 })
  .then((resp) => res.json(resp))
  .catch((err) => {
    res.status(400);
    res.send(err);
  });

const remove = (req, res) => Contact.remove({ _id: req.params.id })
  .then((resp) => res.json(resp))
  .catch((err) => {
    res.status(400);
    res.send(err);
  });

const update = (req, res) => Contact.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
  .then((resp) => res.json(resp))
  .catch((err) => {
    res.status(400);
    res.send(err);
  });

const rest = {
  create,
  findAll,
  remove,
  update,
};

export default rest;
