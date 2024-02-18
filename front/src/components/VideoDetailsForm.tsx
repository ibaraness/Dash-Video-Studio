import { Paper, Stack, TextField, Grid, Button, Box, Chip } from "@mui/material";

const VideoDetailsForm = () => {
    const handleDelete = (event: any) => {
        console.log(event);
    }

    return (
        <Paper>
            <Stack sx={{ px: 4, py: 2, mb: 2 }}>
                <TextField sx={{ mb: 4 }} label="Title" variant="standard" />
                <TextField
                    sx={{ mb: 4 }}
                    label="Description"
                    multiline
                    rows={4}
                    defaultValue=""
                />
                <Grid container sx={{ mb: 4 }} spacing={2}>
                    <Grid item xs={6}>
                        <TextField sx={{ width: "100%" }} label="Tag" variant="standard" />
                    </Grid>
                    <Grid item xs={4}>
                        <Button variant="contained">Add</Button>
                    </Grid>
                </Grid>

                <Box sx={{ mb: 4 }}>
                    <Chip sx={{ mr: 1 }} label="Deletable" onDelete={handleDelete} />
                    <Chip label="Deletable" onDelete={handleDelete} />
                    <Chip label="Deletable" onDelete={handleDelete} />
                    <Chip label="Deletable" onDelete={handleDelete} />
                    <Chip label="Deletable" onDelete={handleDelete} />
                    <Chip label="Deletable" onDelete={handleDelete} />
                    <Chip label="Deletable" onDelete={handleDelete} />
                    <Chip label="Deletable" onDelete={handleDelete} />
                </Box>
            </Stack>
        </Paper>
    )
}

export default VideoDetailsForm;