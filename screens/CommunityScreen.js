import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
} from "react-native";
import LottieView from "lottie-react-native";
import { auth, database } from "../firebase";
import {
  ref,
  get,
  push,
  query,
  orderByChild,
  update,
  remove,
  onValue,
} from "firebase/database";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import AuthInput from "../components/auth/AuthInput";
import { uploadImageToImgBB } from "../utils/imageUtils";
import * as ImagePicker from "expo-image-picker";
import { theme } from "../themes";

const POST_TAGS = {
  THOUGHT: "Thought",
  MINDFULNESS: "Mindfulness",
  MEDITATION: "Meditation",
  GRATITUDE: "Gratitude",
  SELF_CARE: "Self Care",
  MOTIVATION: "Motivation",
};

export default function CommunityScreen() {
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [newPost, setNewPost] = useState({
    content: "",
    tags: [],
    imageUrl: null,
  });
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    loadPosts();
    // Set up real-time listener for posts
    const postsRef = ref(database, "posts");
    const unsubscribe = onValue(postsRef, (snapshot) => {
      loadPosts();
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const loadPosts = async () => {
    setPostsLoading(true);
    try {
      const postsRef = ref(database, "posts");
      const postsQuery = query(postsRef, orderByChild("timestamp"));
      const snapshot = await get(postsQuery);

      if (snapshot.exists()) {
        const postsData = [];
        // Convert the snapshot to array and reverse to show newest first
        snapshot.forEach((child) => {
          postsData.unshift({ ...child.val(), id: child.key });
        });
        setPosts(postsData);
      } else {
        setPosts([]); // Set empty array if no posts exist
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      Alert.alert("Error", "Failed to load posts");
    } finally {
      setPostsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [1, 1],
        allowsMultipleSelection: false,
      });

      if (!result.canceled) {
        setImageUploading(true);
        const imageUrl = await uploadImageToImgBB(result.assets[0].uri);
        setNewPost((prev) => ({ ...prev, imageUrl }));
      }
    } catch (error) {
      console.error("Error picking/uploading image:", error);
      Alert.alert("Error", "Failed to upload image. Please try again.");
    } finally {
      setImageUploading(false);
    }
  };

  const toggleTag = (tag) => {
    setNewPost((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handlePost = async () => {
    if (!newPost.content.trim()) return;

    setLoading(true);
    try {
      const postsRef = ref(database, "posts");
      await push(postsRef, {
        content: newPost.content,
        tags: newPost.tags,
        imageUrl: newPost.imageUrl,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        timestamp: new Date().toISOString(),
        likes: 0,
      });

      setNewPost({ content: "", tags: [], imageUrl: null });
      setModalVisible(false);
      loadPosts();
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (post) => {
    try {
      const postRef = ref(database, `posts/${post.id}`);
      const likesRef = ref(database, `posts/${post.id}/likes`);
      const userLikesRef = ref(
        database,
        `posts/${post.id}/likedBy/${auth.currentUser.uid}`
      );

      const snapshot = await get(userLikesRef);
      const hasLiked = snapshot.exists();

      const updates = {};
      if (hasLiked) {
        updates[`/posts/${post.id}/likes`] = (post.likes || 0) - 1;
        updates[`/posts/${post.id}/likedBy/${auth.currentUser.uid}`] = null;
      } else {
        updates[`/posts/${post.id}/likes`] = (post.likes || 0) + 1;
        updates[`/posts/${post.id}/likedBy/${auth.currentUser.uid}`] = true;
      }

      await update(ref(database), updates);
      loadPosts(); // Refresh posts to show updated likes
    } catch (error) {
      console.error("Error updating like:", error);
      Alert.alert("Error", "Failed to update like");
    }
  };

  const handleComment = async () => {
    if (!newComment.trim() || !selectedPost) return;

    try {
      const commentRef = ref(database, `posts/${selectedPost.id}/comments`);
      await push(commentRef, {
        content: newComment,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        timestamp: new Date().toISOString(),
      });

      setNewComment("");
      setCommentModalVisible(false);
      loadPosts(); // Refresh posts to show new comment
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment");
    }
  };

  const openComments = (post) => {
    setSelectedPost(post);
    setCommentModalVisible(true);
  };

  const handleDelete = async (postId) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const postRef = ref(database, `posts/${postId}`);
            await remove(postRef);
            // Immediately update the local state
            setPosts((currentPosts) =>
              currentPosts.filter((post) => post.id !== postId)
            );
            Alert.alert("Success", "Post deleted successfully");
          } catch (error) {
            console.error("Error deleting post:", error);
            Alert.alert("Error", "Failed to delete post");
          }
        },
      },
    ]);
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <Text style={styles.commentAuthor}>{item.userEmail}</Text>
      <Text style={styles.commentContent}>{item.content}</Text>
      <Text style={styles.commentTime}>
        {new Date(item.timestamp).toLocaleDateString()}
      </Text>
    </View>
  );

  const renderPost = ({ item }) => (
    <Card style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.postAuthor}>{item.userEmail}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.postTime}>
            {new Date(item.timestamp).toLocaleDateString()}
          </Text>
          {item.userId === auth.currentUser.uid && (
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              style={styles.deleteButton}
            >
              <MaterialIcons
                name="delete"
                size={20}
                color={theme.colors.error}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {item.imageUrl && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.postImage}
            resizeMode="cover"
          />
        </View>
      )}

      <Text style={styles.postContent}>{item.content}</Text>

      <View style={styles.tagsContainer}>
        {item.tags?.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.interactionBar}>
        <TouchableOpacity
          style={styles.interactionButton}
          onPress={() => handleLike(item)}
        >
          <Ionicons
            name={
              item.likedBy?.[auth.currentUser.uid] ? "heart" : "heart-outline"
            }
            size={24}
            color={
              item.likedBy?.[auth.currentUser.uid]
                ? theme.colors.error
                : theme.colors.text
            }
          />
          <Text style={styles.interactionText}>{item.likes || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.interactionButton}
          onPress={() => openComments(item)}
        >
          <Ionicons
            name="chatbubble-outline"
            size={24}
            color={theme.colors.text}
          />
          <Text style={styles.interactionText}>
            {Object.keys(item.comments || {}).length}
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (postsLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require("../assets/animations/loading.json")}
          autoPlay
          loop
          style={styles.loadingAnimation}
        />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Post</Text>

            <AuthInput
              placeholder="What's on your mind?"
              value={newPost.content}
              onChangeText={(content) =>
                setNewPost((prev) => ({ ...prev, content }))
              }
              multiline
              style={styles.contentInput}
            />

            <View style={styles.tagsGrid}>
              {Object.values(POST_TAGS).map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagButton,
                    newPost.tags.includes(tag) && styles.tagButtonSelected,
                  ]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text
                    style={[
                      styles.tagButtonText,
                      newPost.tags.includes(tag) &&
                        styles.tagButtonTextSelected,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Add Image"
              onPress={handleImagePick}
              style={styles.imageButton}
              disabled={imageUploading}
            />

            {imageUploading ? (
              <View style={styles.imageUploadingContainer}>
                <LottieView
                  source={require("../assets/animations/uploading.json")}
                  autoPlay
                  loop
                  style={styles.uploadingAnimation}
                />
                <Text style={styles.uploadingText}>Uploading image...</Text>
              </View>
            ) : (
              newPost.imageUrl && (
                <Image
                  source={{ uri: newPost.imageUrl }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              )
            )}

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setNewPost({ content: "", tags: [], imageUrl: null });
                  setModalVisible(false);
                }}
                style={styles.cancelButton}
              />
              <Button
                title={loading ? "Posting..." : "Post"}
                onPress={handlePost}
                disabled={loading || !newPost.content.trim()}
                style={styles.postButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={commentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.commentHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity
                onPress={() => {
                  setCommentModalVisible(false);
                  setNewComment("");
                  setSelectedPost(null);
                }}
                style={styles.closeButton}
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={Object.values(selectedPost?.comments || {})}
              renderItem={renderComment}
              keyExtractor={(item, index) => index.toString()}
              style={styles.commentsList}
            />

            <View style={styles.commentInput}>
              <AuthInput
                placeholder="Add a comment..."
                value={newComment}
                onChangeText={setNewComment}
                style={styles.commentTextInput}
              />
              <Button
                title="Post"
                onPress={handleComment}
                disabled={!newComment.trim()}
                style={styles.commentButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.md,
  },
  contentInput: {
    height: 100,
    textAlignVertical: "top",
  },
  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: theme.spacing.md,
  },
  tagButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    margin: 4,
  },
  tagButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tagButtonText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  tagButtonTextSelected: {
    color: theme.colors.card,
  },
  imageButton: {
    marginVertical: theme.spacing.sm,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.sm,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  postButton: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  postCard: {
    margin: theme.spacing.sm,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  postAuthor: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
  },
  postTime: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontFamily: theme.fonts.regular,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    marginVertical: theme.spacing.sm,
    backgroundColor: "#f0f0f0",
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
  },
  postImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  postContent: {
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    marginBottom: theme.spacing.sm,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    margin: 2,
  },
  tagText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  interactionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: theme.spacing.sm,
  },
  interactionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.sm,
  },
  interactionText: {
    marginLeft: theme.spacing.xs,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  commentContainer: {
    padding: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  commentAuthor: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    marginBottom: 2,
  },
  commentContent: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    marginBottom: 4,
  },
  commentTime: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  commentsList: {
    maxHeight: "60%",
  },
  commentInput: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
  commentTextInput: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  commentButton: {
    width: 80,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButton: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingAnimation: {
    width: 200,
    height: 200,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
  },
  imageUploadingContainer: {
    width: "100%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.sm,
  },
  uploadingAnimation: {
    width: 100,
    height: 100,
  },
  uploadingText: {
    marginTop: theme.spacing.sm,
    fontSize: 14,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
});
