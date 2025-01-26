import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";

const AccessRequestsTable = ({ requests, onApprove, onReject }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID поста</TableCell>
            <TableCell>Пользователь</TableCell>
            <TableCell>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.post_id}</TableCell>
              <TableCell>{request.requester_username}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => onApprove(request.id)}
                  sx={{ marginRight: 1 }}
                >
                  Одобрить
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => onReject(request.id)}
                >
                  Запретить
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AccessRequestsTable;