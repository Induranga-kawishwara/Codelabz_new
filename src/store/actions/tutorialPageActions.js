import * as actions from "./actionTypes";

export const getTutorialFeedIdArray = uid => async (_, firestore) => {
  try {
    let followings = [];
    if (uid) {
      followings = await firestore
        .collection("user_followers")
        .where("followerId", "==", uid)
        .where("isPublished", "==", true)
        .get()
        .then(async docs => {
          const result = [];
          for (const doc of docs.docs) {
            const handle = await firestore
              .collection("cl_user")
              .doc(doc.data().followingId)
              .get()
              .then(doc => doc.data().handle);

            result.push(handle);
          }
          return result;
        });
    }
    let followingUsersTutorials = [];
    if (followings.length > 0) {
      followingUsersTutorials = await firestore
        .collection("tutorials")
        .where("created_by", "in", followings)
        .where("isPublished", "==", true)
        .limit(50)
        .get()
        .then(docs => {
          const tutorialsArray = [];
          docs.docs.map(doc => {
            const tutorialId = doc.id;
            tutorialsArray.push(tutorialId);
          });
          return tutorialsArray;
        });
    }
    let newTutorials = [];
    if (followings.length > 0) {
      newTutorials = await firestore
        .collection("tutorials")
        .where("created_by", "not-in", followings)
        .where("isPublished", "==", true)
        .limit(50)
        .get()
        .then(docs => {
          const tutorialsArray = [];
          docs.docs.map(doc => {
            const tutorialId = doc.id;
            tutorialsArray.push(tutorialId);
          });
          return tutorialsArray;
        });
    } else {
      newTutorials = await firestore
        .collection("tutorials")
        .where("isPublished", "==", true)
        .limit(50)
        .get()
        .then(docs => {
          const tutorialsArray = [];
          docs.docs.map(doc => {
            const tutorialId = doc.id;
            tutorialsArray.push(tutorialId);
          });
          return tutorialsArray;
        });
    }

    const tutorials = followingUsersTutorials.concat(newTutorials);

    return tutorials;
  } catch (e) {
    console.log(e);
  }
};

export const getTutorialFeedData =
  tutorialIdArray => async (firebase, firestore, dispatch) => {
    try {
      dispatch({ type: actions.GET_TUTORIAL_FEED_START });
      const tutorials = await firestore
        .collection("tutorials")
        .where("tutorial_id", "in", tutorialIdArray)
        .get();
      if (tutorials.empty) {
        dispatch({ type: actions.GET_TUTORIAL_FEED_SUCCESS, payload: [] });
      } else {
        const feed = tutorials.docs.map(doc => {
          const tutorial = doc.data();
          const tutorialData = {
            tutorial_id: tutorial?.tutorial_id,
            title: tutorial?.title,
            summary: tutorial?.summary,
            owner: tutorial?.owner,
            created_by: tutorial?.created_by,
            createdAt: tutorial?.createdAt,
            featured_image: tutorial?.featured_image,
            tut_tags: tutorial?.tut_tags,
            upVotes: tutorial?.upVotes || 0,
            downVotes: tutorial?.downVotes || 0
          };
          return tutorialData;
        });
        dispatch({ type: actions.GET_TUTORIAL_FEED_SUCCESS, payload: feed });
      }
    } catch (e) {
      dispatch({ type: actions.GET_TUTORIAL_FEED_FAILED, payload: e });
    }
  };

export const getTutorialData = tutorialID => async (firestore, dispatch) => {
  try {
    dispatch({ type: actions.GET_POST_DATA_START });
    const data = await firestore.collection("tutorials").doc(tutorialID).get();
    const tutorial = data.data();
    if (tutorial.comments && Array.isArray(tutorial.comments)) {
      tutorial.comments.reverse();
    }
    dispatch({ type: actions.GET_POST_DATA_SUCCESS, payload: tutorial });
  } catch (e) {
    dispatch({ type: actions.GET_POST_DATA_FAIL });
    console.log(e);
  }
};

export const getTutorialSteps = tutorialID => async (firestore, dispatch) => {
  try {
    dispatch({ type: actions.GET_STEPS_DATA_START });
    const data = await firestore
      .collection("tutorials")
      .doc(tutorialID)
      .collection("steps")
      .get()
      .then(querySnapshot => {
        let steps = [];
        querySnapshot.forEach(doc => {
          steps.push(doc.data());
        });
        return steps;
      });
    dispatch({ type: actions.GET_STEPS_DATA_SUCCESS, payload: data });
  } catch (e) {
    dispatch({ type: actions.GET_STEPS_DATA_FAIL, payload: e });
    console.log(e);
  }
};

export const getCommentData = commentId => async (firestore, dispatch) => {
  try {
    dispatch({ type: actions.GET_COMMENT_DATA_START });
    const data = await firestore.collection("cl_comments").doc(commentId).get();
    const comment = data.data();
    dispatch({ type: actions.GET_COMMENT_DATA_SUCCESS, payload: comment });
  } catch (e) {
    dispatch({ type: actions.GET_COMMENT_DATA_FAIL });
    console.log(e);
  }
};

export const getCommentReply = commentId => async (firestore, dispatch) => {
  try {
    console.log("commentId", commentId);
    dispatch({ type: actions.GET_REPLIES_START });
    console.log("Get replies");
    const replies = await firestore
      .collection("cl_comments")
      .where("replyTo", "==", commentId)
      .get()
      .then(querySnapshot => {
        let data = [];
        querySnapshot.forEach(doc => {
          data.push(doc.data().comment_id);
        });
        return data;
      });
    dispatch({
      type: actions.GET_REPLIES_SUCCESS,
      payload: { replies, comment_id: commentId }
    });
  } catch (e) {
    console.log(e);
  }
};

export const addComment = comment => async (firebase, firestore, dispatch) => {
  try {
    dispatch({ type: actions.ADD_COMMENT_START });

    const docref = await firestore.collection("cl_comments").add(comment);

    await firestore.collection("cl_comments").doc(docref.id).update({
      comment_id: docref.id
    });

    if (comment.replyTo === comment.tutorial_id) {
      await firestore
        .collection("tutorials")
        .doc(comment.tutorial_id)
        .update({
          comments: firebase.firestore.FieldValue.arrayUnion(docref.id)
        });
    }

    dispatch({ type: actions.ADD_COMMENT_SUCCESS });
  } catch (e) {
    dispatch({ type: actions.ADD_COMMENT_FAILED, payload: e.message });
  }
};

export const getRecommendedTutorials =
  currentTutorialTags => async firestore => {
    try {
      const tutorialsRef = firestore.collection("tutorials");

      // Fetch tutorials with matching tags
      const querySnapshot = await tutorialsRef
        .where("tut_tags", "array-contains-any", currentTutorialTags)
        .get();

      // Calculate relevance score based on matching tags
      const recommendedTutorials = querySnapshot.docs
        .map(doc => {
          const tutorial = doc.data();

          // Skip unpublished tutorials
          if (!tutorial.isPublished) return null;

          const matchingTags = tutorial.tut_tags.filter(tag =>
            currentTutorialTags.includes(tag)
          );
          return {
            ...tutorial,
            relevanceScore: matchingTags.length
          };
        })
        .filter(tutorial => tutorial !== null); // Remove null values from the array

      recommendedTutorials.sort((a, b) => b.relevanceScore - a.relevanceScore);

      return recommendedTutorials;
    } catch (error) {
      console.error("Error fetching recommended tutorials:", error);
      return [];
    }
  };

export const getAllTags = () => async (firebase, firestore) => {
  try {
    const tagCollectionRef = firestore.collection("tag_frequencies");
    const snapshot = await tagCollectionRef.orderBy("count", "desc").get();

    const tags = snapshot.docs.map(doc => ({
      name: doc.id,
      count: doc.data().count || 0
    }));

    return tags;
  } catch (error) {
    console.error("Error fetching tags:", error);
    throw error;
  }
};

export const getFilteredTutorials =
  (selectedTags = []) =>
  async firestore => {
    try {
      const tutorialsRef = firestore.collection("tutorials");
      let query = tutorialsRef;

      if (selectedTags.length > 0) {
        // If tags are selected, filter by those tags
        query = query.where("tut_tags", "array-contains-any", selectedTags);
      }

      const querySnapshot = await query.get();

      const filteredTutorials = querySnapshot.docs
        .map(doc => {
          const tutorial = doc.data();
          if (!tutorial.isPublished) return null;

          // Calculate relevance score if tags are selected
          if (selectedTags.length > 0) {
            const matchingTags = tutorial.tut_tags.filter(tag =>
              selectedTags.includes(tag)
            );
            return {
              ...tutorial,
              relevanceScore: matchingTags.length
            };
          }
          return tutorial;
        })
        .filter(tutorial => tutorial !== null);

      // Sort by relevance score if tags are selected
      if (selectedTags.length > 0) {
        filteredTutorials.sort((a, b) => b.relevanceScore - a.relevanceScore);
      }

      return filteredTutorials;
    } catch (error) {
      console.error("Error fetching filtered tutorials:", error);
      return [];
    }
  };
