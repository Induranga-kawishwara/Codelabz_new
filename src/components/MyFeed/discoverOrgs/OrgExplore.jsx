import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Tabs, Tab, Paper } from "@mui/material";
import { makeStyles } from "@mui/styles";
import OrgsCarousel from "./components/orgsCarousel";
import TagCard from "../../CardTabs/Tags";
import { getAllTags } from "../../../store/actions";
import { useFirebase, useFirestore } from "react-redux-firebase";
const useStyles = makeStyles(theme => ({
  container: {
    padding: "30px 40px 0"
  },
  heading: {
    fontSize: "1.2rem",
    fontWeight: "600",
    marginBottom: "10px"
  },
  subHeading: {
    fontSize: "1rem",
    marginBottom: "10px",
    fontWeight: "400"
  }
}));
const OrgsExplore = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const classes = useStyles();

  const [tags, setTags] = useState([]);
  const firebase = useFirebase();
  const firestore = useFirestore();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const fetchedTags = await getAllTags()(firebase, firestore);

        setTags(fetchedTags);

        console.log(tags);
      } catch (Error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchTags();
  }, [firebase, firestore]);

  const handleTabChange = (e, value) => {
    setSelectedTab(value);
  };

  return (
    <>
      <Box className={classes.container}>
        <Typography
          variant="h4"
          className={classes.heading}
          data-testId="codefeedTitle"
        >
          Discover Organizations
        </Typography>
        <Typography variant="h5" className={classes.subHeading}>
          Explore top rated organization and find what you are looking for
        </Typography>
        <Tabs
          scrollButtons="auto"
          value={selectedTab}
          onChange={handleTabChange}
        >
          <Tab label="All" />
          <Tab label="Design" />
          <Tab label="JavaScript" />
          <Tab label="Web Development" />
          <Tab label="Android" />
        </Tabs>
        <OrgsCarousel />
        <Grid
          container
          alignContent="center"
          direction="column"
          style={{
            width: "100%"
          }}
          data-testId="explorePageTag"
        >
          <Grid item>
            <TagCard tags={tags} sx={{ width: "100%" }} />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default OrgsExplore;
