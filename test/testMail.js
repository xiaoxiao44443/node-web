/**
 * Created by xiao on 2018/3/18.
 */
import mail from '../src/tool/mail';
try {
    mail.sendReplyMall(3);
} catch (err) {
    console.log(err.message);
}
