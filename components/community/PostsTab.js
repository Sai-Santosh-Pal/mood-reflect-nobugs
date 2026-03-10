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
import { auth, database } from "../../firebase";
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
import Card from "../common/Card";
import Button from "../common/Button";
import AuthInput from "../auth/AuthInput";
import { uploadImageToImgBB } from "../../utils/imageUtils";
import * as ImagePicker from "expo-image-picker";
import { theme } from "../../themes";

const POST_TAGS = {
  THOUGHT: "Thought",
  MINDFULNESS: "Mindfulness",
  MEDITATION: "Meditation",
  GRATITUDE: "Gratitude",
  SELF_CARE: "Self Care",
  MOTIVATION: "Motivation",
};

export default function PostsTab() {
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
    const postsRef = ref(database, "posts");
    const unsubscribe = onValue(postsRef, () => {
      loadPosts();
    });
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
        snapshot.forEach((child) => {
          postsData.unshift({ ...child.val(), id: child.key });
        });
        setPosts(postsData);
      } else {
        setPosts([]);
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
      loadPosts();
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
      loadPosts();
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
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const postRef = ref(database, `posts/${postId}`);
            await remove(postRef);
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

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postDate.toLocaleDateString();
  };

  const getInitials = (email) => {
    if (!email) return "?";
    return email.charAt(0).toUpperCase();
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <View style={styles.commentRow}>
        <View style={styles.commentAvatar}>
          <Text style={styles.commentAvatarText}>
            {getInitials(item.userEmail)}
          </Text>
        </View>
        <View style={styles.commentBody}>
          <Text style={styles.commentAuthor}>{item.userEmail}</Text>
          <Text style={styles.commentContent}>{item.content}</Text>
          <Text style={styles.commentTime}>{getTimeAgo(item.timestamp)}</Text>
        </View>
      </View>
    </View>
  );

  const renderPost = ({ item }) => (
    <Card style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.postAuthorRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(item.userEmail)}
            </Text>
          </View>
          <View>
            <Text style={styles.postAuthor}>{item.userEmail}</Text>
            <Text style={styles.postTime}>{getTimeAgo(item.timestamp)}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {item.userId === auth.currentUser.uid && (
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              style={styles.deleteButton}
            >
              <MaterialIcons
                name="delete-outline"
                size={20}
                color={theme.colors.error}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.postContent}>{item.content}</Text>

      {item.imageUrl && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.postImage}
            resizeMode="cover"
          />
        </View>
      )}

      {item.tags?.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.interactionBar}>
        <TouchableOpacity
          style={styles.interactionButton}
          onPress={() => handleLike(item)}
        >
          <Ionicons
            name={
              item.likedBy?.[auth.currentUser.uid] ? "heart" : "heart-outline"
            }
            size={22}
            color={
              item.likedBy?.[auth.currentUser.uid]
                ? theme.colors.error
                : theme.colors.inactive
            }
          />
          <Text
            style={[
              styles.interactionText,
              item.likedBy?.[auth.currentUser.uid] && { color: theme.colors.error },
            ]}
          >
            {item.likes || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.interactionButton}
          onPress={() => openComments(item)}
        >
          <Ionicons
            name="chatbubble-outline"
            size={22}
            color={theme.colors.inactive}
          />
          <Text style={styles.interactionText}>
            {Object.keys(item.comments || {}).length}
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color={theme.colors.inactive} />
      <Text style={styles.emptyTitle}>No posts yet</Text>
      <Text style={styles.emptySubtitle}>
        Be the first to share something with the community!
      </Text>
      <Button
        title="Create Post"
        onPress={() => setModalVisible(true)}
        style={styles.emptyButton}
      />
    </View>
  );

  if (postsLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require("../../assets/animations/loading.json")}
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
        contentContainerStyle={posts.length === 0 && styles.emptyListContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <MaterialIcons name="edit" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Create Post Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Post</Text>
              <TouchableOpacity
                onPress={() => {
                  setNewPost({ content: "", tags: [], imageUrl: null });
                  setModalVisible(false);
                }}
              >
                <MaterialIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <AuthInput
              placeholder="What's on your mind?"
              value={newPost.content}
              onChangeText={(content) =>
                setNewPost((prev) => ({ ...prev, content }))
              }
              multiline
              style={styles.contentInput}
            />

            <Text style={styles.tagsLabel}>Tags</Text>
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
                      newPost.tags.includes(tag) && styles.tagButtonTextSelected,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={handleImagePick}
              disabled={imageUploading}
            >
              <Ionicons name="image-outline" size={22} color={theme.colors.primary} />
              <Text style={styles.imagePickerText}>Add Photo</Text>
            </TouchableOpacity>

            {imageUploading ? (
              <View style={styles.imageUploadingContainer}>
                <LottieView
                  source={require("../../assets/animations/uploading.json")}
                  autoPlay
                  loop
                  style={styles.uploadingAnimation}
                />
                <Text style={styles.uploadingText}>Uploading image...</Text>
              </View>
            ) : (
              newPost.imageUrl && (
                <View style={styles.previewImageWrapper}>
                  <Image
                    source={{ uri: newPost.imageUrl }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() =>
                      setNewPost((prev) => ({ ...prev, imageUrl: null }))
                    }
                  >
                    <MaterialIcons name="close" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              )
            )}

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setNewPost({ content: "", tags: [], imageUrl: null });
                  setModalVisible(false);
                }}
                variant="secondary"
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

      {/* Comments Modal */}
      <Modal
        visible={commentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Comments ({Object.keys(selectedPost?.comments || {}).length})
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setCommentModalVisible(false);
                  setNewComment("");
                  setSelectedPost(null);
                }}
              >
                <MaterialIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {Object.keys(selectedPost?.comments || {}).length === 0 ? (
              <View style={styles.emptyCommentsContainer}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={48}
                  color={theme.colors.inactive}
                />
                <Text style={styles.emptyCommentsText}>
                  No comments yet. Be the first!
                </Text>
              </View>
            ) : (
              <FlatList
                data={Object.values(selectedPost?.comments || {})}
                renderItem={renderComment}
                keyExtractor={(item, index) => index.toString()}
                style={styles.commentsList}
              />
            )}

            <View style={styles.commentInput}>
              <AuthInput
                placeholder="Write a comment..."
                value={newComment}
                onChangeText={setNewComment}
                style={styles.commentTextInput}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !newComment.trim() && styles.sendButtonDisabled,
                ]}
                onPress={handleComment}
                disabled={!newComment.trim()}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
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
    backgroundColor: "#FEBE",
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FEBE",
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
  // Empty state
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.inactive,
    textAlign: "center",
    marginTop: theme.spacing.sm,
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: 32,
  },
  // Post card
  postCard: {
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.xs,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  postAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.sm,
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: theme.fonts.bold,
  },
  postAuthor: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: theme.colors.text,
  },
  postTime: {
    color: theme.colors.inactive,
    fontSize: 12,
    fontFamily: theme.fonts.regular,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
  postContent: {
    fontSize: 15,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.sm,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    marginBottom: theme.spacing.sm,
    backgroundColor: "#f0f0f0",
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: theme.spacing.sm,
  },
  tag: {
    backgroundColor: `${theme.colors.primary}20`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.round,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontFamily: theme.fonts.medium,
  },
  interactionBar: {
    flexDirection: "row",
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  interactionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: theme.spacing.lg,
    paddingVertical: 4,
  },
  interactionText: {
    marginLeft: 6,
    color: theme.colors.inactive,
    fontFamily: theme.fonts.medium,
    fontSize: 14,
  },
  // FAB
  fab: {
    position: "absolute",
    right: 20,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
  },
  contentInput: {
    height: 100,
    textAlignVertical: "top",
  },
  tagsLabel: {
    fontSize: 14,
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: theme.spacing.sm,
  },
  tagButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    margin: 3,
  },
  tagButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tagButtonText: {
    color: theme.colors.inactive,
    fontFamily: theme.fonts.medium,
    fontSize: 13,
  },
  tagButtonTextSelected: {
    color: "#fff",
  },
  imagePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    marginBottom: theme.spacing.sm,
  },
  imagePickerText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.primary,
    fontFamily: theme.fonts.medium,
    fontSize: 14,
  },
  previewImageWrapper: {
    position: "relative",
    marginBottom: theme.spacing.sm,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: theme.borderRadius.md,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  imageUploadingContainer: {
    width: "100%",
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FEBE",
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  uploadingAnimation: {
    width: 80,
    height: 80,
  },
  uploadingText: {
    marginTop: theme.spacing.sm,
    fontSize: 13,
    fontFamily: theme.fonts.medium,
    color: theme.colors.inactive,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.sm,
  },
  cancelButton: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  postButton: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  // Comments
  commentsList: {
    maxHeight: "60%",
  },
  commentContainer: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  commentRow: {
    flexDirection: "row",
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  commentAvatarText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: theme.fonts.bold,
  },
  commentBody: {
    flex: 1,
  },
  commentAuthor: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 13,
    color: theme.colors.text,
    marginBottom: 2,
  },
  commentContent: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  commentTime: {
    fontFamily: theme.fonts.regular,
    fontSize: 11,
    color: theme.colors.inactive,
    marginTop: 4,
  },
  emptyCommentsContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyCommentsText: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.inactive,
  },
  commentInput: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  commentTextInput: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#e0e0e0",
  },
});
