import { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Button,
  Row,
  Col
} from 'react-bootstrap';
import { useMutation, useQuery } from '@apollo/client';
import { REMOVE_BOOK } from '../utils/mutations';
import { GET_ME } from '../utils/queries';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage'; 

const SavedBooks = () => {
  const { loading, data, refetch } = useQuery(GET_ME);
  const [removeBookMutation] = useMutation(REMOVE_BOOK);

  useEffect(() => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      console.error("No token found, user isn't logged in");
      return;
    }

    refetch();
  }, []);

  const handleDeleteBook = async (bookId) => {
    if (!Auth.loggedIn()) {
      console.error('You must be logged in to remove a book.');
      return false;
    }

    try {
      await removeBookMutation({
        variables: { bookId },
      });
      removeBookId(bookId); 
    } catch (err) {
      console.error('Error deleting the book:', err);
    }
  };

  if (loading) {
    return <h2>LOADING...</h2>;
  }

  const userData = data?.me || {};

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks?.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks?.map((book) => (
            <Col key={book.bookId} md="4">
              <Card border='dark'>
                {book.image && <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors.join(', ')}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
