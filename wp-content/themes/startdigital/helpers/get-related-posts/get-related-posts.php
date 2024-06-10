<?php

/**
 * A custom function to get recent posts in a way that the query can still be effectively cached
 * By default this function just grabs the most recent posts
 *
 * Cache problem explained - https://docs.wpvip.com/technical-references/code-quality-and-best-practices/using-post__not_in/
 *
 * @param PostType $post_type
 * @param PostsPerPage $post_per_page
 * @param CurrentPostID $current_post_id
 *
 * @return Array $posts Recent posts
 */
function get_related_posts(int $current_post_id, string|array $post_type = 'post', int $posts_per_page = 4, ?array $args = array()): array
{
  if (!isset($current_post_id)) {
    throw new Error('Post ID is required.');
  }

  // Default, required args
  $arguments = array(
    'post_type' => $post_type,
    'post_status' => 'publish',
    'posts_per_page' => $posts_per_page,
  );

  // Add new args if specified
  if (!empty($args) && is_associative($args)) {
    foreach ($args as $key => $value) {
      $arguments[$key] = $value;
    }
  }

  $posts = Timber\Timber::get_posts($arguments);

  $recent_posts = array();
  foreach ($posts as $index => $post) {
    if ($index >= $posts_per_page) {
      break;
    }

    // And not the page we're on
    if ($current_post_id && $post->ID == $current_post_id) {
      continue;
    }

    $recent_posts[] = $post;
  }

  return $recent_posts;
}

/**
 * Checks if an array is associative. Return value of 'False' indicates a sequential array.
 * @param array $inpt_arr
 * @return bool
 */
function is_associative(array $inpt_arr): bool
{
  // An empty array is in theory a valid associative array
  // so we return 'true' for empty.
  if ([] === $inpt_arr) {
    return true;
  }
  $n = count($inpt_arr);
  for ($i = 0; $i < $n; $i++) {
    if (!array_key_exists($i, $inpt_arr)) {
      return true;
    }
  }
  // Dealing with a Sequential array
  return false;
}
