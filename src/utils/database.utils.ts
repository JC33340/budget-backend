import pool from '../config/db.config';

export const checkdb =()=>{
    //pinging the database to see if it has been redeployed
    return new Promise((resolve,reject)=>{setTimeout(async ()=>{
        try{
            //trying to send a query to the db
            const result = await pool.query('SELECT * FROM users')
        }catch(e){
            //if if fails the promise returns with a rejection
            reject('not deployed')
        }
        //otherwise it is resolved
        resolve('deployed')
        //sending a query every 2 seconds
    },2000)})
}