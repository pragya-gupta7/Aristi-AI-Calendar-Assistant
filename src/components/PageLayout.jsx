import Typography from "@mui/material/Typography";
import NavBar from "./NavBar";

export const PageLayout = (props) => {
  return (
    <>
      <NavBar />
      <br />
      <Typography variant="h5">
        <center>Hello, I am Aristi. I am here to help you.</center>
      </Typography>
      <br />
      {props.children}
    </>
  );
};
