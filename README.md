# KNz Media Organiser

## Getting Started
```bash
npm run dev
```
## Data models
Tag model:
```
[
  {
    name: "Category",
    kind: "string",
    values: ["sl", "bl", "tl"]
  },
  {
    name: "Category",
    kind: "string",
    values: ["sl", "bl", "tl"]
  }
]
```
Album model:
```
[
  {
    id: "dqv234234",
    name: "Album name",
    dateCreated: 'timestamp',
    items: ["path/to/file.jpg", "path/to/file.jpg", "path/to/file.jpg"]
  },
  {
    id: "rt23455",
    name: "Album name",
    dateCreated: 'timestamp',
    items: ["path/to/file.jpg", "path/to/file.jpg", "path/to/file.jpg"]
  }
]
```
## Algorithm for albums
### Showing the images in main
Starts
gets to a entry with image.album array not empty
renders an album ImageElement 
saves the all the album ids in a `temp` array
(Maybe store the `temp` array inside the `db.config.runtime` of `db` state)
skips all the other entries with an album id from the `temp` array
### Creating an album
Get all selected images in `selectedItems` array
Get name, if needed description
Create an entry in db.config.albums with an uniqueId
Save that uniqueId in the image entry in an array (one to many relationship)
