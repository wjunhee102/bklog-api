export const setWhitelist = (env: string | undefined) => {
  console.log(env);
  if(env === "prod") {
    return ['https://bklog-app.web.app', 'https://bklog-app.vercel.app']
  } else {
    return ['http://localhost', 'http://localhost:3000', 'http://localhost:4500', undefined];
  }
}