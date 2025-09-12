import {Router} from 'express';
 const router = Router();



router.get('/', (req, res, next) => {
  res.json({ msg: "hello from base router" })
})
export default router;

