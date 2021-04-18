import mysql from 'mysql';
import { ConnectionConfig } from 'mysql';
import { User } from '../../models/User';
import { loadSync } from '../../config';

const config = loadSync();

async function getUserByEmail(email: string): Promise<User> {
    const conn = mysql.createConnection({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password
    });

    conn.connect();

    return new Promise<User>((resolve, reject) => {
        conn.query(`select bin_to_uuid(u.id) as id, u.name, u.email, u.password_hash, group_concat(ur.role) as roles
        from user u
        left join user_roles ur
        on u.id = ur.user_id
        where u.email = ?
        group by u.id`,
        [email],
        (err, results, fields) => {
            if(err) {
                reject(err);
            } else if(results.length === 0) {
                return resolve(null);
            } else {
                return resolve({
                    id: results[0].id,
                    name: results[0].name,
                    email: results[0].email,
                    roles: results[0].roles.split(','),
                    passwordHash: results[0].password_hash
                });
            }
        });
    });
}

async function addOrUpdateUser(user: User) {
    const conn = mysql.createConnection({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password
    });

    conn.connect();
    // do atomic
    // save user info
    await new Promise<User>((resolve, reject) => {
        conn.query('INSERT INTO user (id, name, email, password_hash) VALUES (uuid_to_bin(?), ?, ?, ?)',
        [user.id, user.name, user.email, user.passwordHash],
        (err, results, fields) => {
            // tslint:disable-next-line: no-console
            console.debug(results.length, results[0]);
            if(err) {
                reject(err);
            } else if(results.affectedRows === 0) {
                return resolve(null);
            } else {
                return resolve(user);
            }
        });
    });
    // save roles

    // commit
}
export default {
    getUserByEmail, addOrUpdateUser
}