#!/bin/bash

echo "Checking if git is installed..."
if ! command -v git &>/dev/null; then
  echo "Git is not installed. Please install Git and make sure it's in your PATH."
  exit 1
fi

echo "Checking if ipfs is installed..."
if ! command -v ipfs &>/dev/null; then
  echo "IPFS is not installed. Please install IPFS and make sure it's in your PATH."
  exit 1
fi
ipfs init &>/dev/null;

# Checks if at least one file is provided as an argument
if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <file1> <file2> ..."
  exit 1
fi



echo "Creating files combinated hash..."
declare -a hashes
for file in "$@"; do
  if [ -f "$file" ]; then
    hash=$(git hash-object "$file")
    hashes+=("$hash")
  else
    echo "File not found: $file"
  fi
done
combined_hash=$(echo -n "${hashes[@]}" | git hash-object -w --stdin)
echo $combined_hash



echo "Creating tarball..."
timestamp=$(date '+%Y-%m-%dT%H-%M-%S')
tar_filename="${combined_hash}_${timestamp}.tar.gz"
tar -czvf "$tar_filename" "$@"

echo "Uploading tarball to IPFS..."
ipfs_hash=$(ipfs add -Q --only-hash "$tar_filename")
ipfs get "$ipfs_hash"

if [ $? -eq 0 ]; then
  echo "$tar_filename already exists on IPFS"
  rm "$ipfs_hash"
else
  ipfs_hash=$(ipfs add -Q "$tar_filename")
  echo "IPFS CID: $ipfs_hash"
fi



echo "Getting author data..."
git_author_name=$(git config --global user.name)
git_author_email=$(git config --global user.email)



echo "Submitting registration to blockchain..."
# url="https://example.com/api/endpoint"
data="{\"combinatedFilesHash\":\"$combined_hash\",\"hashAlgorithm\":0,\"ipfsUrl\":\"$ipfs_hash\",\"authorName\":\"$git_author_name\",\"authorEmail\":\"$git_author_email\"}"
# curl -X POST -H "Content-Type: application/json" -d "$data" "$url"
echo "$data"
