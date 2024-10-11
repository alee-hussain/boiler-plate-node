/** @format */

const Joi = require("joi");

class UserSchema {
  register_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      identifier: Joi.string().max(100).required(),
      password: Joi.string()
        .pattern(/^(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .max(16)
        .required(),
      user_type: Joi.string().valid("CONTENT_CREATOR", "USER").required(),
    }),
  });

  login_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      identifier: Joi.string().max(100).required(),
      fcm_token: Joi.string(),
      password: Joi.string()
        .pattern(/^(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .max(16)
        .required(),
    }),
  });

  verify_otp_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      identifier: Joi.string().max(100).required(),
      otp: Joi.number().integer().min(0).max(999999).required(),
      fcm_token: Joi.string(),
    }),
  });

  forget_password_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      identifier: Joi.string().max(100).required(),
    }),
  });

  reset_password_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      password: Joi.string()
        .pattern(/^(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .max(16)
        .required(),
    }),
  });

  change_password_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      password: Joi.string()
        .pattern(/^(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .max(16)
        .required(),
      old_password: Joi.string()
        .pattern(/^(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .max(16)
        .required(),
    }),
  });

  resend_otp_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      identifier: Joi.string().max(100).required(),
    }),
  });

  social_login_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      token: Joi.string().required(),
      fcm_token: Joi.string(),
      user_type: Joi.string().valid("CONTENT_CREATOR", "USER"),
    }),
  });

  logout_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      refresh_token: Joi.string().required(),
    }),
  });

  get_all_users_schema = Joi.object({
    query: Joi.object({ user_name: Joi.string() }),
    params: Joi.object({}),
    body: Joi.object({}),
  });

  get_by_id_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({ userId: Joi.string().required() }),
    body: Joi.object({}),
  });

  edit_user_profile_picture_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({}),
  });

  edit_user_profile_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      business_name: Joi.string().required(),
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      description: Joi.string().required(),
      address: Joi.string().required(),
      gender: Joi.string().required(),
      date_of_birth: Joi.string(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      contact_phone: Joi.string().pattern(/^\d{3}-\d{3}-\d{4}$/),
      contact_email: Joi.string().email(),
      is_notification: Joi.boolean(),
      is_available: Joi.boolean(),
    }),
  });

  create_user_profile_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      business_name: Joi.string().required(),
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      description: Joi.string().required(),
      address: Joi.string().required(),
      gender: Joi.string().required(),
      date_of_birth: Joi.string(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      contact_phone: Joi.string().pattern(/^\d{3}-\d{3}-\d{4}$/),
      contact_email: Joi.string().email(),
    }),
  });

  edit_content_creator_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      business_name: Joi.string().required(),
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      description: Joi.string().required(),
      address: Joi.string().required(),
      gender: Joi.string().required(),
      date_of_birth: Joi.string(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      contact_phone: Joi.string().pattern(/^\d{3}-\d{3}-\d{4}$/),
      contact_email: Joi.string().email(),
      is_notification: Joi.boolean(),
      is_available: Joi.boolean(),
    }),
  });

  create_content_creator_schema = Joi.object({
    query: Joi.object({}),
    params: Joi.object({}),
    body: Joi.object({
      business_name: Joi.string().required(),
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      description: Joi.string().required(),
      address: Joi.string().required(),
      gender: Joi.string().required(),
      date_of_birth: Joi.string(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      contact_phone: Joi.string().pattern(/^\d{3}-\d{3}-\d{4}$/),
      contact_email: Joi.string().email(),
    }),
  });
}

module.exports = UserSchema;
