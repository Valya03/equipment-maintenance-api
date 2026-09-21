import { v4 as uuidv4 } from "uuid";

const requestId = (req, res, next) => {
  const id = req.headers["x-request-id"] || uuidv4().slice(0, 8);
  req.id = id;
  res.setHeader("X-Request-Id", id);
  next();
};

export default requestId;
