const _ = require("lodash");
const { Aim_user_info } = require("../../models");

const FORBIDDEN = 403;

async function authUser(req, res, next) {
  try {
    const headerToken = req.get("Authorization") || "";

    let token = headerToken.match(/Bearer\s(\S+)/);
    if (_.isEmpty(token)) {
      return res.sendStatus(FORBIDDEN);
    }
    const findUser = await Aim_user_info.findOne({
      where: { accessToken: token },
    });
    if (_.isNil(findUser)) {
      return res.sendStatus(FORBIDDEN);
    }

    req.user = findUser;

    return next();
  } catch (err) {
    return res.sendStatus(FORBIDDEN);
  }
}

module.exports = authUser;
