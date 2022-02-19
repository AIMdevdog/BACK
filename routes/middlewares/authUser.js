const _ = require("lodash");
const { Aim_user_info } = require("../../models");

const Unauthorized = 401;

async function authUser(req, res, next) {
  try {
    const headerToken = req.get("Authorization") || "";

    let token = headerToken.match(/Bearer\s(\S+)/);
    console.log(token);
    if (_.isEmpty(token)) {
      return res.sendStatus(Unauthorized);
    }
    const findUser = await Aim_user_info.findOne({
      where: { accessToken: token },
    });
    if (_.isNil(findUser)) {
      return res.sendStatus(Unauthorized);
    }

    req.user = findUser;

    return next();
  } catch (err) {
    return res.sendStatus(Unauthorized);
  }
}

module.exports = authUser;
