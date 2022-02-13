const _ = require("lodash");
const { Aim_user_info } = require("../../models");

const FORBIDDEN = {
  code: 403,
  message: "허용되지 않은 행동입니다.",
};

async function authUser(req, res, next) {
  try {
    const headerToken = req.get("Authorization") || "";

    let token = headerToken.match(/Bearer\s(\S+)/);
    if (_.isEmpty(token)) {
      return next(FORBIDDEN);
    }
    const findUser = await Aim_user_info.findOne({
      where: { accessToken: token },
    });
    if (_.isNil(findUser)) {
      return next(FORBIDDEN);
    }

    req.user = [];

    return next();
  } catch (err) {
    return next(FORBIDDEN);
  }
}

module.exports = authUser;
